<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Route::get('/test-db', function () {
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
});
