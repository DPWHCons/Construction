<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ProjectImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        
        // Get archived images
        $imagesQuery = ProjectImage::where('is_archived', true)
            ->with('project')
            ->orderBy('archived_at', 'desc'); // Most recently archived first
        
        if ($search) {
            $imagesQuery->where(function($query) use ($search) {
                $query->where('caption', 'like', '%' . $search . '%')
                      ->orWhereHas('project', function($projectQuery) use ($search) {
                          $projectQuery->where('title', 'like', '%' . $search . '%');
                      });
            });
        }
        
        $archivedImages = $imagesQuery->paginate(20);
        
        // Get archived projects
        $projectsQuery = \App\Models\Project::where('is_archive', true)
            ->with(['category', 'scope', 'progress', 'remarks', 'assignedEngineers', 'images'])
            ->orderBy('updated_at', 'desc'); // Most recently updated first
        
        if ($search) {
            $projectsQuery->where(function($query) use ($search) {
                $query->where('title', 'like', '%' . $search . '%')
                      ->orWhereHas('category', function($categoryQuery) use ($search) {
                          $categoryQuery->where('name', 'like', '%' . $search . '%');
                      });
            });
        }
        
        $archivedProjects = $projectsQuery->paginate(10);
        
        // Format images for frontend
        $formattedImages = collect($archivedImages->getCollection()->map(function ($image) {
            return [
                'id' => $image->id,
                'url' => $image->url,
                'image_path' => $image->image_path,
                'caption' => $image->caption ?? 'Untitled Image',
                'originalProject' => $image->project->title ?? 'Unknown Project',
                'deletedDate' => $image->archived_at->format('M j, Y'),
                'deletionReason' => 'Manually archived',
                'archived_at' => $image->archived_at,
            ];
        })->toArray());
        
        // Get archived categories
        $categoriesQuery = Category::withCount('projects')
            ->where('is_archived', true)
            ->orderBy('archived_at', 'desc'); // Most recently archived first
        
        if ($search) {
            $categoriesQuery->where('name', 'like', '%' . $search . '%');
        }
        
        $archivedCategories = $categoriesQuery->paginate(10);
        
        // Get archived contractors
        $contractorsQuery = DB::table('project_scopes')
            ->select(
                'contractor_name',
                DB::raw('COUNT(DISTINCT project_id) as projects_count'),
                DB::raw('MAX(archived_at) as archived_at')
            )
            ->where('contractor_name', '!=', '')
            ->whereNotNull('contractor_name')
            ->where('is_archived', true)
            ->groupBy('contractor_name')
            ->orderBy('archived_at', 'desc');
        
        if ($search) {
            $contractorsQuery->where('contractor_name', 'like', '%' . $search . '%');
        }
        
        $archivedContractors = $contractorsQuery->paginate(10);
        
        return Inertia::render('Archive', [
            'archivedImages' => $formattedImages,
            'archivedProjects' => $archivedProjects,
            'archivedCategories' => $archivedCategories,
            'archivedContractors' => $archivedContractors,
        ]);
    }

    /**
     * Restore all archived categories
     */
    public function restoreAllCategories(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $restoredCount = Category::where('is_archived', true)->update([
                'is_archived' => false,
                'archived_at' => null,
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully restored {$restoredCount} categories",
                'restored_count' => $restoredCount,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore categories: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore an archived project
     */
    public function restoreProject(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $project = Project::findOrFail($id);
            $project->update([
                'is_archive' => false,
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Project restored successfully',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore project: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete an archived project
     */
    public function deleteProject(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $project = Project::findOrFail($id);
            
            // Delete associated images and their files
            foreach ($project->images as $image) {
                if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                $image->delete();
            }
            
            // Delete the project
            $project->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Project permanently deleted',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete project: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete all archived categories
     */
    public function deleteAllCategories(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $categoriesToDelete = Category::where('is_archived', true)->get();
            $deletedCount = $categoriesToDelete->count();
            
            // Delete categories and their relationships
            foreach ($categoriesToDelete as $category) {
                $category->delete();
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} categories permanently",
                'deleted_count' => $deletedCount,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete categories: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore images for a specific project
     */
    public function restoreProjectImages(Request $request)
    {
        $projectTitle = $request->input('project_title');
        
        try {
            DB::beginTransaction();
            
            $imagesToRestore = ProjectImage::where('is_archived', true)
                ->whereHas('project', function($query) use ($projectTitle) {
                    $query->where('title', $projectTitle);
                })
                ->get();
            
            $restoredCount = $imagesToRestore->count();
            
            if ($restoredCount === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No archived images found for this project',
                ], 404);
            }
            
            // Update images to unarchive them
            ProjectImage::where('is_archived', true)
                ->whereHas('project', function($query) use ($projectTitle) {
                    $query->where('title', $projectTitle);
                })
                ->update([
                    'is_archived' => false,
                    'archived_at' => null,
                    'updated_at' => now(),
                ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully restored {$restoredCount} images from '{$projectTitle}'",
                'restored_count' => $restoredCount,
                'project_title' => $projectTitle,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore images: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete images for a specific project
     */
    public function deleteProjectImages(Request $request)
    {
        $projectTitle = $request->input('project_title');
        
        try {
            DB::beginTransaction();
            
            $imagesToDelete = ProjectImage::where('is_archived', true)
                ->whereHas('project', function($query) use ($projectTitle) {
                    $query->where('title', $projectTitle);
                })
                ->get();
            
            $deletedCount = $imagesToDelete->count();
            
            if ($deletedCount === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No archived images found for this project',
                ], 404);
            }
            
            // Delete image files from storage and database records
            foreach ($imagesToDelete as $image) {
                // Delete file from storage if it exists
                if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                
                // Delete database record
                $image->delete();
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} images from '{$projectTitle}' permanently",
                'deleted_count' => $deletedCount,
                'project_title' => $projectTitle,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete images: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore all archived contractors
     */
    public function restoreAllContractors(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $restoredCount = DB::table('project_scopes')
                ->where('is_archived', true)
                ->update([
                    'is_archived' => false,
                    'archived_at' => null,
                ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully restored {$restoredCount} contractor records",
                'restored_count' => $restoredCount,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore contractors: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete all archived contractors
     */
    public function deleteAllContractors(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $deletedCount = DB::table('project_scopes')
                ->where('is_archived', true)
                ->update([
                    'contractor_name' => null,
                    'is_archived' => false,
                    'archived_at' => null,
                ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} contractor records permanently",
                'deleted_count' => $deletedCount,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete contractors: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore contractors for a specific project
     */
    public function restoreProjectContractors(Request $request)
    {
        $projectTitle = $request->input('project_title');
        
        try {
            DB::beginTransaction();
            
            $restoredCount = DB::table('project_scopes')
                ->where('is_archived', true)
                ->whereHas('project', function($query) use ($projectTitle) {
                    $query->where('title', $projectTitle);
                })
                ->update([
                    'is_archived' => false,
                    'archived_at' => null,
                ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully restored {$restoredCount} contractor records from '{$projectTitle}'",
                'restored_count' => $restoredCount,
                'project_title' => $projectTitle,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore contractors: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete contractors for a specific project
     */
    public function deleteProjectContractors(Request $request)
    {
        $projectTitle = $request->input('project_title');
        
        try {
            DB::beginTransaction();
            
            $deletedCount = DB::table('project_scopes')
                ->where('is_archived', true)
                ->whereHas('project', function($query) use ($projectTitle) {
                    $query->where('title', $projectTitle);
                })
                ->update([
                    'contractor_name' => null,
                    'is_archived' => false,
                    'archived_at' => null,
                ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} contractor records from '{$projectTitle}' permanently",
                'deleted_count' => $deletedCount,
                'project_title' => $projectTitle,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete contractors: ' . $e->getMessage(),
            ], 500);
        }
    }
}
