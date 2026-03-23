<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class DebugController extends Controller
{
    public function testDatabase()
    {
        try {
            // Check if project_images table exists
            if (!Schema::hasTable('project_images')) {
                return response()->json(['error' => 'project_images table does not exist']);
            }
            
            // Get column information
            $columns = DB::select("SHOW COLUMNS FROM project_images");
            
            // Check if any images exist
            $imageCount = DB::table('project_images')->count();
            
            // Get sample images if any exist
            $sampleImages = DB::table('project_images')->limit(3)->get();
            
            return response()->json([
                'success' => true,
                'table_exists' => true,
                'columns' => $columns,
                'image_count' => $imageCount,
                'sample_images' => $sampleImages,
                'image_path_type' => collect($columns)->firstWhere('Field', 'image_path')->Type ?? 'not found'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }
    
    public function testImageUpload(Request $request)
    {
        try {
            Log::info('Test image upload received', [
                'has_files' => $request->hasFile('images'),
                'all_files' => array_keys($request->allFiles()),
                'request_keys' => array_keys($request->all()),
                'images_count' => count($request->file('images', []))
            ]);
            
            if ($request->hasFile('images')) {
                $images = [];
                
                // Find an existing project or create a test one
                $project = DB::table('projects')->first();
                if (!$project) {
                    return response()->json(['error' => 'No projects found in database. Please create a project first.']);
                }
                
                foreach ($request->file('images') as $index => $image) {
                    $imageData = file_get_contents($image->getPathname());
                    // Encode binary data as base64 to store in LONGTEXT
                    $base64Data = base64_encode($imageData);
                    
                    $imageId = DB::table('project_images')->insertGetId([
                        'project_id' => $project->id,
                        'image_path' => $base64Data,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $images[] = ['id' => $imageId, 'size' => strlen($imageData), 'filename' => $image->getClientOriginalName()];
                }
                
                return response()->json([
                    'success' => true,
                    'message' => 'Images uploaded successfully',
                    'images' => $images,
                    'project_id' => $project->id
                ]);
            }
            
            return response()->json(['error' => 'No images found']);
        } catch (\Exception $e) {
            Log::error('Test image upload failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()]);
        }
    }
}
