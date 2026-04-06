<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ProjectImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

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
        
        // Format documents for frontend
        $formattedDocuments = collect($archivedImages->getCollection()->map(function ($image) {
            return [
                'id' => $image->id,
                'url' => $image->url,
                'image_path' => $image->image_path,
                'filename' => $image->filename ?? $image->caption ?? 'Untitled Document',
                'caption' => $image->caption ?? $image->filename ?? 'Untitled Document',
                'originalProject' => $image->project->title ?? 'Unknown Project',
                'project_year' => $image->project->project_year ?? 'N/A',
                'contract_id' => $image->project->contract_id ?? 'N/A',
                'deletedDate' => $image->archived_at ? $image->archived_at->format('M j, Y') : 'N/A',
                'deletionReason' => 'Manually archived',
                'archived_at' => $image->archived_at,
                'document_date' => $image->document_date,
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
            'archivedDocuments' => $formattedDocuments,
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
     * Restore a single archived category
     */
    public function restoreCategory(Request $request, $id)
    {
        \Log::info('restoreCategory called', ['id' => $id]);
        
        try {
            DB::beginTransaction();
            
            $category = Category::where('is_archived', true)->find($id);
            \Log::info('Category found', ['category' => $category ? $category->toArray() : null]);
            
            if (!$category) {
                \Log::warning('Category not found', ['id' => $id]);
                DB::rollBack();
                return redirect()->route('archive.index')->with('error', 'Category not found');
            }
            
            \Log::info('Before update', ['is_archived' => $category->is_archived]);
            
            $category->update([
                'is_archived' => false,
                'archived_at' => null,
            ]);
            
            \Log::info('After update', ['is_archived' => $category->fresh()->is_archived]);
            
            // Clear category-related caches
            $this->clearCategoryCaches();
            
            DB::commit();
            
            \Log::info('Category restored successfully');
            
            return redirect()->route('categories.index')->with('success', 'Category restored successfully.');
            
        } catch (\Exception $e) {
            \Log::error('restoreCategory error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            DB::rollBack();
            
            return redirect()->route('archive.index')->with('error', 'Failed to restore category: ' . $e->getMessage());
        }
    }

    /**
     * Permanently delete a single archived category
     */
    public function deleteCategory(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $category = Category::where('is_archived', true)->find($id);
            
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }
            
            $category->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Category permanently deleted',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category: ' . $e->getMessage(),
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
            
            // Find the project manually
            $project = \App\Models\Project::find($id);
            
            if (!$project) {
                DB::rollBack();
                return redirect()->route('archive.index')->with('error', 'Project not found');
            }
            
            $project->update([
                'is_archive' => false,
            ]);
            
            DB::commit();
            
            return redirect()->route('archive.index')->with('success', 'Project restored successfully');
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('archive.index')->with('error', 'Failed to restore project: ' . $e->getMessage());
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
     * Restore a single archived image
     */
    public function restoreImage($id)
    {
        try {
            $image = ProjectImage::where('is_archived', true)->find($id);
            
            if (!$image) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image not found or not archived'
                ], 404);
            }
            
            $image->is_archived = false;
            $image->archived_at = null;
            $image->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Image restored successfully',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete a single archived image
     */
    public function deleteImage($id)
    {
        try {
            $image = ProjectImage::where('is_archived', true)->find($id);
            
            if (!$image) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image not found or not archived'
                ], 404);
            }
            
            // Delete file from storage if it exists
            if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
            
            // Delete database record
            $image->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Image permanently deleted',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore a single archived contractor
     */
    public function restoreContractor($name)
    {
        \Log::info('restoreContractor called', ['name' => $name]);
        
        try {
            $restoredCount = DB::table('project_scopes')
                ->where('contractor_name', $name)
                ->where('is_archived', true)
                ->update([
                    'is_archived' => false,
                    'archived_at' => null,
                ]);
            
            \Log::info('Contractor restore result', ['name' => $name, 'restoredCount' => $restoredCount]);
            
            if ($restoredCount === 0) {
                \Log::warning('Contractor not found or already restored', ['name' => $name]);
                return redirect()->route('archive.index')->with('error', 'Contractor not found or already restored');
            }
            
            \Log::info('Contractor restored successfully');
            
            return redirect()->route('archive.index')->with('success', 'Contractor restored successfully');
            
        } catch (\Exception $e) {
            \Log::error('restoreContractor error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->route('archive.index')->with('error', 'Failed to restore contractor: ' . $e->getMessage());
        }
    }

    /**
     * Permanently delete a single archived contractor
     */
    public function deleteContractor($name)
    {
        try {
            $deletedCount = DB::table('project_scopes')
                ->where('contractor_name', $name)
                ->where('is_archived', true)
                ->update([
                    'contractor_name' => null,
                    'is_archived' => false,
                    'archived_at' => null,
                ]);
            
            if ($deletedCount === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contractor not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Contractor permanently deleted',
                'deleted_count' => $deletedCount,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete contractor: ' . $e->getMessage(),
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
    
    /**
     * Clear all category-related caches
     */
    private function clearCategoryCaches()
    {
        // Clear all caches by flushing (simpler and driver-agnostic)
        Cache::flush();
    }
}
