<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->get('year', 'all');
        $search = $request->get('search');
        $status = $request->get('status');
        
        // Create cache key based on filters and page number
        $cacheKey = "categories_" . md5(serialize([
            'year' => $year,
            'search' => $search,
            'status' => $status,
            'page' => $request->get('page', 1)
        ]));
        
        // Cache categories for 1 hour (3600 seconds)
        $categories = Cache::remember($cacheKey, 3600, function () use ($year, $search, $status) {
            // Start query
            $query = Category::where('is_archived', false);
            
            // Apply search filter
            if ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            }
            
            // Apply status filter
            if ($status === 'with_projects') {
                if ($year !== 'all') {
                    // When year is specified, filter categories with projects in that year
                    $query->whereHas('projects', function($query) use ($year) {
                        $query->where('project_year', $year);
                    });
                } else {
                    // When no year specified, filter categories with any projects
                    $query->whereHas('projects');
                }
            } elseif ($status === 'without_projects') {
                if ($year !== 'all') {
                    // When year is specified, filter categories without projects in that year
                    $query->whereDoesntHave('projects', function($query) use ($year) {
                        $query->where('project_year', $year);
                    });
                } else {
                    // When no year specified, filter categories without any projects
                    $query->whereDoesntHave('projects');
                }
            }
            
            // Add projects count based on filter status
            if ($status === 'with_projects' && $year !== 'all') {
                // For "with_projects" with specific year, show count only for that year
                $query->withCount(['projects' => function($query) use ($year) {
                    $query->where('project_year', $year);
                }]);
            } else {
                // For all other cases, show total projects across all years
                $query->withCount('projects');
            }
            
            // Get paginated results (10 per page) with newest first ordering
            return $query->orderBy('created_at', 'desc')->paginate(10);
        });
        
        // Cache total projects count for 30 minutes
        $totalProjectsCacheKey = "total_projects_{$year}";
        $totalProjects = Cache::remember($totalProjectsCacheKey, 1800, function () use ($year) {
            return Category::join('projects', 'categories.id', '=', 'projects.category_id')
                ->when($year !== 'all', function($query) use ($year) {
                    $query->where('projects.project_year', $year);
                })
                ->count();
        });
        
        return Inertia::render('Categories', [
            'categories' => $categories,
            'totalProjects' => $totalProjects,
            'selectedYear' => $year,
        ]);
    }
    
    public function create()
    {
        return Inertia::render('Categories/Create');
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);
        
        $category = Category::create([
            'name' => $request->name,
        ]);
        
        // Log the creation
        AuditLog::log(
            'created',
            'category',
            $category->id,
            $category->name,
            null,
            $category->toArray()
        );
        
        // Clear category-related caches
        $this->clearCategoryCaches();
        
        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }
    
    public function edit(Category $category)
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }
    
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);
        
        $oldValues = $category->toArray();
        
        $category->update([
            'name' => $request->name,
        ]);
        
        // Log the update
        AuditLog::log(
            'updated',
            'category',
            $category->id,
            $category->name,
            $oldValues,
            $category->toArray()
        );
        
        // Clear category-related caches
        $this->clearCategoryCaches();
        
        return redirect()->route('categories.index')
            ->with('success', 'Category updated successfully.');
    }
    
    public function archive(Category $category)
    {
        $category->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);
        
        // Log the archive action
        AuditLog::log(
            'archived',
            'category',
            $category->id,
            $category->name,
            ['is_archived' => false],
            ['is_archived' => true, 'archived_at' => now()]
        );
        
        // Clear category-related caches
        $this->clearCategoryCaches();
        
        return redirect()->route('categories.index')
            ->with('success', 'Category archived successfully.');
    }
    
    public function restore(Category $category)
    {
        $category->update([
            'is_archived' => false,
            'archived_at' => null,
        ]);
        
        // Log the restore action
        AuditLog::log(
            'restored',
            'category',
            $category->id,
            $category->name,
            ['is_archived' => true, 'archived_at' => $category->archived_at],
            ['is_archived' => false, 'archived_at' => null]
        );
        
        // Clear category-related caches
        $this->clearCategoryCaches();
        
        return redirect()->route('categories.index')
            ->with('success', 'Category restored successfully.');
    }
    
    public function archived(Request $request)
    {
        // This method is no longer needed since archived categories are integrated into the Archive page
        // Redirect to the main Archive page
        return redirect()->route('archive.index');
    }
    
    public function destroy(Category $category)
    {
        $oldValues = $category->toArray();
        
        $category->delete();
        
        // Log the deletion
        AuditLog::log(
            'deleted',
            'category',
            $category->id,
            $category->name,
            $oldValues,
            null
        );
        
        // Clear category-related caches
        $this->clearCategoryCaches();
        
        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully.');
    }
    
    /**
     * Clear all category-related caches
     */
    private function clearCategoryCaches()
    {
        // Clear only category-related caches by pattern
        $cache = Cache::getFacadeRoot();
        if (method_exists($cache, 'getStore')) {
            $store = $cache->getStore();
            if (method_exists($store, 'getPrefix')) {
                $prefix = $store->getPrefix();
            }
        }
        
        // Clear caches with 'categories_' prefix
        if (function_exists('cache')) {
            // Try to clear by pattern if supported
            try {
                $redis = Cache::getRedis();
                if ($redis) {
                    $keys = $redis->keys('categories_*');
                    if (!empty($keys)) {
                        $redis->del($keys);
                    }
                }
            } catch (\Exception $e) {
                // Fallback to flush all caches if selective clearing fails
                Cache::flush();
            }
        } else {
            // Fallback to flush all caches
            Cache::flush();
        }
    }
}
