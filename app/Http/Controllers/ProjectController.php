<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectScope;
use App\Models\ProjectProgress;
use App\Models\ProjectRemark;
use App\Models\ProjectImage;
use App\Models\AssignedEngineer;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Project::with([
            'scope',
            'progress',
            'remarks',
            'assignedEngineers',
            'images' => function($query) {
                $query->where('is_archived', false); // Only get non-archived images
            },
            'category',
        ])->where('is_archive', false);

        // Enhanced search across multiple fields
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                // Search by project title
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  // Search by contract ID
                  ->orWhere('contract_id', 'like', '%' . $searchTerm . '%')
                  // Search by category name
                  ->orWhereHas('category', function($subQuery) use ($searchTerm) {
                      $subQuery->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->year && $request->year !== 'all') {
            $query->whereRaw('CAST(project_year AS UNSIGNED) = ?', [(int) $request->year]);
        }
        if ($request->letter && $request->letter !== 'All') {
            $query->where('title', 'like', $request->letter . '%');
        }
        $availableLettersQuery = Project::where('is_archive', false);
        
        if ($request->search) {
            $searchTerm = $request->search;
            $availableLettersQuery->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('category', function($subQuery) use ($searchTerm) {
                      $subQuery->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        if ($request->status && $request->status !== 'all') {
            $availableLettersQuery->where('status', $request->status);
        }

        if ($request->year && $request->year !== 'all') {
            $availableLettersQuery->whereRaw('CAST(project_year AS UNSIGNED) = ?', [(int) $request->year]);
        }

        // Get unique first letters from titles
        $availableLetters = $availableLettersQuery->pluck('title')
            ->filter(function($title) {
                return $title && strlen($title) > 0;
            })
            ->map(function($title) {
                return strtoupper(substr($title, 0, 1));
            })
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        // Only paginate when filtering by a specific year
        // When showing all years, return all projects without pagination
        if ($request->year && $request->year !== 'all') {
            $projects = $query->orderBy('created_at', 'desc')->paginate(10);
        } else {
            // Show all years without pagination
            $allProjects = $query->orderBy('project_year', 'desc')->get();
            
            // Create a simple paginator that shows all items on one page
            $projects = new \Illuminate\Pagination\LengthAwarePaginator(
                $allProjects,
                $allProjects->count(),
                $allProjects->count() > 0 ? $allProjects->count() : 1, // Show all on one page
                1, // Current page is always 1
                ['path' => $request->url(), 'query' => $request->query()]
            );
            
            // Add custom property to indicate no pagination
            $projects->isYearPagination = false;
            $projects->noPagination = true;
        }
        $categories = \App\Models\Category::orderBy('name')->get();
        
        // Get all available years for dropdown (independent of current filters)
        $availableYears = \App\Models\Project::select('project_year')
            ->whereNotNull('project_year')
            ->where('project_year', '!=', 'Unknown Year')
            ->distinct()
            ->orderBy('project_year', 'desc')
            ->pluck('project_year');

        // Ensure relationships are properly serialized for Inertia
        $projects->getCollection()->transform(function ($project) {
            $project->assignedEngineers = $project->assignedEngineers->toArray();
            return $project;
        });

        return Inertia::render('ManageProject', [
            'projects' => $projects,
            'categories' => $categories,
            'availableLetters' => $availableLetters,
            'availableYears' => $availableYears,
            'selectedYear' => $request->year ?? 'all',
            'filters' => $request->only(['search', 'status', 'month', 'year', 'letter'])
        ]);
    }

    /**
     * Display public landing page with projects.
     */
    public function landing(Request $request)
    {
        $query = Project::with([
            'scope',
            'progress',
            'remarks',
            'assignedEngineers',
            'images',
            'category',
        ])->where('is_archive', false);

        // Search functionality for public view
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('contract_id', 'like', '%' . $searchTerm . '%')
                  ->orWhere('project_id', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('category', function($subQuery) use ($searchTerm) {
                      $subQuery->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        // Filter by year
        if ($request->year && $request->year !== 'all') {
            $query->where('project_year', $request->year);
        }

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Get all projects ordered by date started (newest first)
        $allProjects = $query->orderBy('date_started', 'desc')->get();
        
        // Create a simple paginator that shows all items on one page
        $projects = new \Illuminate\Pagination\LengthAwarePaginator(
            $allProjects,
            $allProjects->count(),
            $allProjects->count() > 0 ? $allProjects->count() : 1,
            1,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        
        $projects->isYearPagination = false;
        $projects->noPagination = true;
        
        // Get all available years for dropdown
        $availableYears = \App\Models\Project::select('project_year')
            ->whereNotNull('project_year')
            ->where('project_year', '!=', 'Unknown Year')
            ->distinct()
            ->orderBy('project_year', 'desc')
            ->pluck('project_year');

        // Ensure relationships are properly serialized for Inertia
        $projects->getCollection()->transform(function ($project) {
            $project->assignedEngineers = $project->assignedEngineers->toArray();
            return $project;
        });

        return Inertia::render('LandingPage', [
            'projects' => $projects,
            'availableYears' => $availableYears,
            'filters' => $request->only(['search', 'year', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = \App\Models\Category::orderBy('name')->get();
        
        return Inertia::render('Projects/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Custom validation for engineer titles
        $request->merge([
            'engineer_title_1' => $this->validateEngineerTitles($request->input('engineer_title_1')),
            'engineer_title_2' => $this->validateEngineerTitles($request->input('engineer_title_2')),
            'engineer_title_3' => $this->validateEngineerTitles($request->input('engineer_title_3')),
            'engineer_title_4' => $this->validateEngineerTitles($request->input('engineer_title_4')),
        ]);
        
        $validated = $request->validate([
            // Basic project info (optional - not in official client format)
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'project_year' => 'required|integer|min:2020|max:2030',
            'date_started' => 'nullable|date',
            'project_cost' => 'required|numeric|min:0',  // Fixed: use project_cost instead of amount
            'status' => 'required|in:ongoing,completed,pending',
            'completion_date' => 'nullable|date',
            
            // Category
            'category_id' => 'nullable|exists:categories,id',
            'new_category' => 'nullable|string|max:255',
            
            // Contract information with unique validation
            'project_id' => [
                'required',
                'string',
                'max:255',
            ],
            'contract_id' => [
                'required',
                'string',
                'max:255',
                'unique:projects,contract_id',
            ],
            
            // Financial Information
            'program_amount' => 'nullable|numeric|min:0',
            'revised_project_cost' => 'nullable|numeric|min:0',
            
            // Scope of work
            'duration_cd' => 'nullable|integer|min:0',
            'project_engineer' => 'nullable|string|max:255',
            'contractor_name' => 'nullable|string|max:255',
            'unit_of_measure' => 'nullable|string|max:255',
            'scope_of_work_main' => 'nullable|string',
            
            // Progress & scope
            'target_actual' => 'nullable|integer|min:0',
            'target_start_actual' => 'nullable|date',
            'target_completion_actual' => 'nullable|date',
            
            // Remarks
            'remarks' => 'nullable|string',
            
            // Assigned engineers
            'assigned_engineer_1' => 'nullable|string|max:255',
            'engineer_title_1' => 'nullable|string',
            'assigned_engineer_2' => 'nullable|string|max:255',
            'engineer_title_2' => 'nullable|string',
            'assigned_engineer_3' => 'nullable|string|max:255',
            'engineer_title_3' => 'nullable|string',
            'assigned_engineer_4' => 'nullable|string|max:255',
            'engineer_title_4' => 'nullable|string',
            
            // Documents
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|mimes:doc,docx|max:512000', // 500MB max for Word documents
        ]);

        // Handle category - flexible approach for user convenience
        $categoryId = $validated['category_id'];
        
        // If user provided a new category name
        if ($validated['new_category']) {
            // Check if category with this name already exists (case-insensitive)
            $existingCategory = \App\Models\Category::whereRaw('LOWER(name) = ?', [strtolower($validated['new_category'])])->first();
            
            if ($existingCategory) {
                // Use existing category
                $categoryId = $existingCategory->id;
            } else {
                // Create new category
                $category = \App\Models\Category::create(['name' => $validated['new_category']]);
                $categoryId = $category->id;
            }
        }
        // If user selected from dropdown but also typed in new_category field, prioritize new_category logic above

        // Create project
        $project = Project::create([
            'title' => $validated['title'],
            'project_year' => $validated['project_year'],
            'date_started' => $validated['date_started'] ?? now()->format('Y-m-d'),
            'project_cost' => $validated['project_cost'],  // Fixed: use project_cost from validation
            'revised_project_cost' => $validated['revised_project_cost'] ?? null,
            'program_amount' => $validated['program_amount'] ?? null,
            'status' => $validated['status'],
            'completion_date' => $validated['completion_date'],
            'category_id' => $categoryId ?: null,
            'project_id' => $validated['project_id'], // Client project identifier
            'contract_id' => $validated['contract_id'], // Contract number
        ]);


        // Create project scope
        if ($validated['duration_cd'] || $validated['project_engineer'] || $validated['contractor_name'] || 
            $validated['unit_of_measure'] || $validated['scope_of_work_main']) {
            $project->scope()->create([
                'duration_cd' => $validated['duration_cd'],
                'project_engineer' => $validated['project_engineer'],
                'contractor_name' => $validated['contractor_name'],
                'unit_of_measure' => $validated['unit_of_measure'],
                'scope_of_work_main' => $validated['scope_of_work_main'],
            ]);
        }

        // Create project progress
        if ($validated['target_actual'] || $validated['target_start_actual'] || $validated['target_completion_actual']) {
            $project->progress()->create([
                'target_actual' => $validated['target_actual'],
                'target_start_actual' => $validated['target_start_actual'],
                'target_completion_actual' => $validated['target_completion_actual'],
            ]);
        }

        // Create project remarks
        if ($validated['remarks']) {
            $project->remarks()->create([
                'remarks' => $validated['remarks'],
            ]);
        }

        // Create assigned engineers
        for ($i = 1; $i <= 4; $i++) {
            $engineerName = $validated["assigned_engineer_{$i}"];
            $engineerTitle = $validated["engineer_title_{$i}"];
            
            if ($engineerName || $engineerTitle) {
                $project->assignedEngineers()->create([
                    'engineer_name' => $engineerName,
                    'engineer_title' => $engineerTitle,
                ]);
            }
        }

        // Handle images - store binary data as base64 in database
        if (isset($validated['images']) && is_array($validated['images'])) {
            foreach ($validated['images'] as $image) {
                try {
                    $imageData = file_get_contents($image->getPathname());
                    // Encode binary data as base64 to store in LONGTEXT
                    $base64Data = base64_encode($imageData);
                    
                    $project->images()->create([
                        'project_id' => $project->id,
                        'image_path' => $base64Data, // Store base64 encoded data
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to store image to database: ' . $e->getMessage());
                    // Continue with other images even if one fails
                }
            }
        }

        // Get updated projects list to return to frontend
        $query = Project::with([
            'scope',
            'progress',
            'remarks',
            'assignedEngineers',
            'images',
            'category'
        ]);

        // Apply the same filters as the index method
        $search = $request->search;
        $status = $request->status;
        $year = $request->year;
        $letter = $request->letter;
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhereHas('category', function($subQuery) use ($search) {
                      $subQuery->where('name', 'like', '%' . $search . '%');
                  });
            });
        }
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        if ($year && $year !== 'all') {
            $query->where('project_year', $year);
        }

        // Filter by letter (alphabetical pagination)
        if ($letter && $letter !== 'All') {
            $query->where('title', 'like', $letter . '%');
        }
        
        // Get available letters for alphabetical pagination (same as index method)
        $availableLettersQuery = Project::query();
        
        // Apply the same filters to available letters query
        if ($search) {
            $availableLettersQuery->where(function($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhereHas('category', function($subQuery) use ($search) {
                      $subQuery->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        if ($status && $status !== 'all') {
            $availableLettersQuery->where('status', $status);
        }

        if ($year && $year !== 'all') {
            $availableLettersQuery->where('project_year', $year);
        }

        // Get unique first letters from titles
        $availableLetters = $availableLettersQuery->pluck('title')
            ->filter(function($title) {
                return $title && strlen($title) > 0;
            })
            ->map(function($title) {
                return strtoupper(substr($title, 0, 1));
            })
            ->unique()
            ->sort()
            ->values()
            ->toArray();
        
        // ALWAYS show all years without pagination after saving a project
        // Ignore any year filter from the request - we want to show all years
        $allProjects = $query->orderBy('project_year', 'desc')->orderBy('created_at', 'desc')->get();
        
        $projects = new \Illuminate\Pagination\LengthAwarePaginator(
            $allProjects,
            $allProjects->count(),
            $allProjects->count() > 0 ? $allProjects->count() : 1,
            1,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        
        $projects->isYearPagination = false;
        $projects->noPagination = true;
        $categories = \App\Models\Category::orderBy('name')->get();
        
        // Get all available years for dropdown (independent of current filters)
        $availableYears = \App\Models\Project::select('project_year')
            ->whereNotNull('project_year')
            ->where('project_year', '!=', 'Unknown Year')
            ->distinct()
            ->orderBy('project_year', 'desc')
            ->pluck('project_year');
        
        // Ensure relationships are properly serialized for Inertia
        $projects->getCollection()->transform(function ($project) {
            $project->assignedEngineers = $project->assignedEngineers->toArray();
            return $project;
        });
        
        // Return Inertia response with updated projects list
        // Preserve the selected year from the request
        return Inertia::render('ManageProject', [
            'projects' => $projects,
            'categories' => $categories,
            'availableLetters' => $availableLetters,
            'availableYears' => $availableYears,
            'selectedYear' => $request->year ?? 'all',
            'filters' => $request->only(['search', 'status', 'year', 'letter'])
        ])->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        // Redirect to the projects page since we don't have a separate show page
        return redirect()->route('projects.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        $project->load([
            'scope',
            'progress',
            'remarks',
            'assignedEngineers'
        ]);
        
        return Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        // Simple log to see if this method is called
        \Log::info('Project update method called', [
            'project_id' => $project->id,
            'request_method' => $request->method(),
            'has_images' => $request->hasFile('images'),
            'all_request_keys' => array_keys($request->all())
        ]);
        
        // Log incoming request data for debugging
        \Log::info('Update request received', [
            'has_files' => $request->hasFile('images'),
            'all_files' => array_keys($request->allFiles()),
            'request_keys' => array_keys($request->all()),
            'images_count' => count($request->file('images', []))
        ]);
        
        // Convert empty strings to null for proper validation
        $requestData = $request->all();
        $requestData = array_map(function($value) {
            return $value === '' ? null : $value;
        }, $requestData);
        $request->merge($requestData);
        
        // Custom validation for engineer titles
        $request->merge([
            'engineer_title_1' => $this->validateEngineerTitles($request->input('engineer_title_1')),
            'engineer_title_2' => $this->validateEngineerTitles($request->input('engineer_title_2')),
            'engineer_title_3' => $this->validateEngineerTitles($request->input('engineer_title_3')),
            'engineer_title_4' => $this->validateEngineerTitles($request->input('engineer_title_4')),
        ]);
        
        $validated = $request->validate([
            'title' => [
                'nullable',
                'string',
                'max:255',
            ],
            'project_year' => 'nullable|integer|min:2020|max:2030',
            'date_started' => 'nullable|date',
            'project_cost' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:ongoing,completed,pending',
            'completion_date' => 'nullable|date',
            
            // Project identifiers
            'project_id' => 'nullable|string|max:255',
            'contract_id' => [
                'nullable',
                'string',
                'max:255',
            ],
            
            // Category
            'category_id' => 'nullable|exists:categories,id',
            'new_category' => 'nullable|string|max:255',
            
            // Financial Information
            'program_amount' => 'nullable|numeric|min:0',
            'revised_project_cost' => 'nullable|numeric|min:0',
            
            // Scope of work
            'duration_cd' => 'nullable|integer|min:0',
            'project_engineer' => 'nullable|string|max:255',
            'contractor_name' => 'nullable|string|max:255',
            'unit_of_measure' => 'nullable|string|max:255',
            'scope_of_work_main' => 'nullable|string',
            
            // Progress & scope
            'target_actual' => 'nullable|integer|min:0',
            'target_start_actual' => 'nullable|date',
            'target_completion_actual' => 'nullable|date',
            
            // Remarks
            'remarks' => 'nullable|string',
            
            // Assigned engineers
            'assigned_engineer_1' => 'nullable|string|max:255',
            'engineer_title_1' => 'nullable|string',
            'assigned_engineer_2' => 'nullable|string|max:255',
            'engineer_title_2' => 'nullable|string',
            'assigned_engineer_3' => 'nullable|string|max:255',
            'engineer_title_3' => 'nullable|string',
            'assigned_engineer_4' => 'nullable|string|max:255',
            'engineer_title_4' => 'nullable|string',
            
            // Documents
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|mimes:doc,docx|max:512000', // 500MB max for Word documents
            'removed_images' => 'nullable|array'
        ]);

        // Update project basic info - only update fields that are provided
        $updateData = [];
        
        if (isset($validated['title']) && $validated['title'] !== null) {
            $updateData['title'] = $validated['title'];
        }
        if (isset($validated['date_started']) && $validated['date_started'] !== null) {
            $updateData['date_started'] = $validated['date_started'];
        }
        if (isset($validated['project_year']) && $validated['project_year'] !== null) {
            $updateData['project_year'] = $validated['project_year'];
        }
        if (isset($validated['project_cost']) && $validated['project_cost'] !== null) {
            $updateData['project_cost'] = $validated['project_cost'];
        }
        if (isset($validated['revised_project_cost']) && $validated['revised_project_cost'] !== null) {
            $updateData['revised_project_cost'] = $validated['revised_project_cost'];
        }
        if (isset($validated['program_amount']) && $validated['program_amount'] !== null) {
            $updateData['program_amount'] = $validated['program_amount'];
        }
        if (isset($validated['status']) && $validated['status'] !== null) {
            $updateData['status'] = $validated['status'];
        }
        if (isset($validated['completion_date']) && $validated['completion_date'] !== null) {
            $updateData['completion_date'] = $validated['completion_date'];
        }
        if (isset($validated['project_id']) && $validated['project_id'] !== null) {
            $updateData['project_id'] = $validated['project_id'];
        }
        if (isset($validated['contract_id']) && $validated['contract_id'] !== null) {
            $updateData['contract_id'] = $validated['contract_id'];
        }
        // Handle category - flexible approach for user convenience
        $categoryId = $validated['category_id'] ?? null;
        
        // If user provided a new category name
        if (isset($validated['new_category']) && $validated['new_category']) {
            // Check if category with this name already exists (case-insensitive)
            $existingCategory = \App\Models\Category::whereRaw('LOWER(name) = LOWER(?)', [$validated['new_category']])->first();
            
            if ($existingCategory) {
                // Use existing category
                $categoryId = $existingCategory->id;
            } else {
                // Create new category
                $category = \App\Models\Category::create(['name' => $validated['new_category']]);
                $categoryId = $category->id;
            }
        }
        
        // Update category if it changed
        if ($categoryId !== null) {
            $updateData['category_id'] = $categoryId;
        }
        
        if (!empty($updateData)) {
            $project->update($updateData);
        }

        // Update or create scope
        if (
            (isset($validated['duration_cd']) && $validated['duration_cd']) ||
            (isset($validated['project_engineer']) && $validated['project_engineer']) ||
            (isset($validated['contractor_name']) && $validated['contractor_name']) ||
            (isset($validated['unit_of_measure']) && $validated['unit_of_measure']) ||
            (isset($validated['scope_of_work_main']) && $validated['scope_of_work_main'])
        ) {
            $scopeData = [
                'duration_cd' => $validated['duration_cd'] ?? null,
                'project_engineer' => $validated['project_engineer'] ?? null,
                'contractor_name' => $validated['contractor_name'] ?? null,
                'unit_of_measure' => $validated['unit_of_measure'] ?? null,
                'scope_of_work_main' => $validated['scope_of_work_main'] ?? null,
            ];
            
            $scope = $project->scope()->firstOrCreate(['project_id' => $project->id]);
            $scope->update($scopeData);
        }

        // Update or create progress
        if (
            (isset($validated['target_actual']) && $validated['target_actual']) ||
            (isset($validated['target_start_actual']) && $validated['target_start_actual']) ||
            (isset($validated['target_completion_actual']) && $validated['target_completion_actual'])
        ) {
            $progressData = [
                'target_actual' => $validated['target_actual'] ?? null,
                'target_start_actual' => $validated['target_start_actual'] ?? null,
                'target_completion_actual' => $validated['target_completion_actual'] ?? null,
            ];
            
            $progress = $project->progress()->firstOrCreate(['project_id' => $project->id]);
            $progress->update($progressData);
        }

        // Update or create remarks
        if (isset($validated['remarks']) && $validated['remarks']) {
            $remark = $project->remarks()->firstOrCreate(['project_id' => $project->id]);
            $remark->update([
                'remarks' => $validated['remarks'],
            ]);
        }

        // Update assigned engineers - first delete existing engineers, then create new ones
        $project->assignedEngineers()->delete();
        
        for ($i = 1; $i <= 4; $i++) {
            $engineerName = $validated["assigned_engineer_{$i}"] ?? null;
            $engineerTitle = $validated["engineer_title_{$i}"] ?? null;
            
            if ($engineerName || $engineerTitle) {
                $project->assignedEngineers()->create([
                    'engineer_name' => $engineerName,
                    'engineer_title' => $engineerTitle,
                ]);
            }
        }

        // Handle images - remove old images first
        if (isset($validated['removed_images']) && is_array($validated['removed_images'])) {
            \Log::info('Processing removed images', ['removed_images' => $validated['removed_images']]);
            foreach ($validated['removed_images'] as $imageId) {
                \Log::info('Deleting image with ID: ' . $imageId);
                $image = $project->images()->find($imageId);
                if ($image) {
                    \Log::info('Found image to delete', ['id' => $image->id, 'filename' => $image->filename]);
                    // For backward compatibility, delete file if it exists
                    if ($image->document && str_contains($image->document, '/')) {
                        Storage::disk('public')->delete($image->document);
                    }
                    $image->delete();
                    \Log::info('Image deleted successfully');
                } else {
                    \Log::warning('Image not found for deletion', ['imageId' => $imageId]);
                }
            }
        } else {
            \Log::info('No removed_images found in validated data');
        }

        // Add new documents - store binary data as base64 in database
        if (isset($validated['images']) && is_array($validated['images'])) {
            \Log::info('Processing documents for update', ['count' => count($validated['images'])]);
            
            foreach ($validated['images'] as $index => $document) {
                try {
                    \Log::info('Processing document', ['index' => $index, 'type' => get_class($document)]);
                    
                    $documentData = file_get_contents($document->getPathname());
                    // Encode binary data as base64 to store in LONGTEXT
                    $base64Data = base64_encode($documentData);
                    
                    $project->images()->create([
                        'project_id' => $project->id,
                        'document' => $base64Data, // Store base64 encoded data
                        'filename' => $document->getClientOriginalName(), // Store original filename
                    ]);
                    
                    \Log::info('Document stored successfully', ['index' => $index]);
                } catch (\Exception $e) {
                    \Log::error('Failed to store document to database: ' . $e->getMessage());
                    // Continue with other documents even if one fails
                }
            }
        } else {
            \Log::info('No documents found in validated data', ['validated_keys' => array_keys($validated)]);
        }

        // Get all projects with relationships and filters (same as index method)
        $query = Project::with([
            'scope',
            'progress',
            'remarks',
            'assignedEngineers',
            'images',
            'category'
        ]);

        // Apply filters from request
        $search = $request->search;
        $status = $request->status;
        $year = $request->year;
        $letter = $request->letter;
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhereHas('category', function($subQuery) use ($search) {
                      $subQuery->where('name', 'like', '%' . $search . '%');
                  });
            });
        }
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        if ($year && $year !== 'all') {
            $query->where('project_year', $year);
        }

        // Filter by letter (alphabetical pagination)
        if ($letter && $letter !== 'All') {
            $query->where('title', 'like', $letter . '%');
        }
        
        // Get available letters for alphabetical pagination (same as index method)
        $availableLettersQuery = Project::query();
        
        // Apply the same filters to available letters query
        if ($search) {
            $availableLettersQuery->where(function($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhereHas('category', function($subQuery) use ($search) {
                      $subQuery->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        if ($status && $status !== 'all') {
            $availableLettersQuery->where('status', $status);
        }

        if ($year && $year !== 'all') {
            $availableLettersQuery->where('project_year', $year);
        }

        // Get unique first letters from titles
        $availableLetters = $availableLettersQuery->pluck('title')
            ->filter(function($title) {
                return $title && strlen($title) > 0;
            })
            ->map(function($title) {
                return strtoupper(substr($title, 0, 1));
            })
            ->unique()
            ->sort()
            ->values()
            ->toArray();
        
        // ALWAYS show all years without pagination after saving a project
        // Ignore any year filter from the request - we want to show all years
        $allProjects = $query->orderBy('project_year', 'desc')->orderBy('created_at', 'desc')->get();
        
        $projects = new \Illuminate\Pagination\LengthAwarePaginator(
            $allProjects,
            $allProjects->count(),
            $allProjects->count() > 0 ? $allProjects->count() : 1,
            1,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        
        $projects->isYearPagination = false;
        $projects->noPagination = true;
        $categories = \App\Models\Category::orderBy('name')->get();
        
        // Get all available years for dropdown (independent of current filters)
        $availableYears = \App\Models\Project::select('project_year')
            ->whereNotNull('project_year')
            ->where('project_year', '!=', 'Unknown Year')
            ->distinct()
            ->orderBy('project_year', 'desc')
            ->pluck('project_year');
        
        // Ensure relationships are properly serialized for Inertia
        $projects->getCollection()->transform(function ($project) {
            $project->assignedEngineers = $project->assignedEngineers->toArray();
            return $project;
        });

        // Return Inertia response with updated projects list
        // Preserve the selected year from the request
        return Inertia::render('ManageProject', [
            'projects' => $projects,
            'categories' => $categories,
            'availableLetters' => $availableLetters,
            'availableYears' => $availableYears,
            'selectedYear' => $request->year ?? 'all',
            'filters' => $request->only(['search', 'status', 'year', 'letter'])
        ])->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        // Delete associated images
        foreach ($project->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project deleted successfully.');
    }

    /**
     * Upload images for a project.
     */
    public function uploadImages(Request $request, Project $project)
    {
        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,jpg,png|max:2048'
        ]);

        foreach ($request->file('images') as $image) {
            try {
                $imageData = file_get_contents($image->getPathname());
                // Encode binary data as base64 to store in LONGTEXT
                $base64Data = base64_encode($imageData);
                
                $project->images()->create([
                    'image_path' => $base64Data, // Store base64 encoded data
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to store image to database: ' . $e->getMessage());
                // Continue with other images even if one fails
            }
        }

        return redirect()->route('projects.show', $project)
            ->with('success', 'Images uploaded successfully.');
    }

    /**
     * Delete an image.
     */
    public function deleteImage(Project $project, $imageId)
    {
        $image = $project->images()->findOrFail($imageId);
        
        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return redirect()->route('projects.show', $project)
            ->with('success', 'Image deleted successfully.');
    }

    
    
    /**
     * Display the archive page.
     */
    public function archive()
    {
        // Fetch archived images from project_images table with project relationship
        $archivedImages = ProjectImage::with('project')
            ->where('is_archived', true)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => $image->image_path ? asset('storage/' . $image->image_path) : '',
                    'originalProject' => $image->project ? $image->project->title : 'Unknown Project',
                    'deletedDate' => $image->updated_at->format('Y-m-d'),
                    'deletionReason' => 'User deletion',
                    'originalPath' => $image->image_path,
                    'filename' => basename($image->image_path ?? ''),
                    'projectId' => $image->project_id,
                ];
            });

        return Inertia::render('Archive', [
            'archivedImages' => $archivedImages,
        ]);
    }

    /**
     * Archive images from gallery.
     */
    public function archiveImages(Request $request)
    {
        $imageIds = $request->input('image_ids', []); // Changed from 'imageIds' to 'image_ids'
        
        // Update project_images to mark as archived
        ProjectImage::whereIn('id', $imageIds)->update([
            'is_archived' => true,
            'archived_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Return JSON response for API calls
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Images archived successfully',
                'archivedCount' => count($imageIds)
            ]);
        }
        
        // Return Inertia response for web requests
        return redirect()->back()
            ->with('success', [
                'message' => 'Images archived successfully',
                'archivedCount' => count($imageIds)
            ]);
    }

    /**
     * Restore archived images.
     */
    public function restoreImages(Request $request)
    {
        $imageIds = $request->input('image_ids', $request->input('imageIds', []));
        
        if (empty($imageIds)) {
            \Log::warning('No image IDs provided for restoration');
            return response()->json([
                'success' => false,
                'message' => 'No images selected for restoration'
            ], 400);
        }
        
        try {
            DB::beginTransaction();
            
            // Check if images exist before restoring
            $existingImages = ProjectImage::whereIn('id', $imageIds)->get();
            \Log::info('Found images to restore', ['count' => $existingImages->count(), 'ids' => $existingImages->pluck('id')]);
            
            if ($existingImages->count() === 0) {
                \Log::warning('No existing images found for the provided IDs', ['requested_ids' => $imageIds]);
                return response()->json([
                    'success' => false,
                    'message' => 'No valid images found to restore'
                ], 404);
            }
            
            // Update project_images to mark as not archived
            $restoredCount = ProjectImage::whereIn('id', $imageIds)->update([
                'is_archived' => false,
                'archived_at' => null,
                'updated_at' => now(),
            ]);
            
            \Log::info('Images restored successfully', ['count' => $restoredCount]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully restored {$restoredCount} images",
                'restored_count' => $restoredCount
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Failed to restore images', [
                'error' => $e->getMessage(),
                'image_ids' => $imageIds,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore images: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete archived images.
     */
    public function permanentDeleteImages(Request $request)
    {
        $imageIds = $request->input('image_ids', $request->input('imageIds', []));
        
        if (empty($imageIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No images selected for deletion'
            ], 400);
        }
        
        try {
            DB::beginTransaction();
            
            // Get images before deletion for file cleanup
            $images = ProjectImage::whereIn('id', $imageIds)->get();
            $deletedCount = 0;
            
            foreach ($images as $image) {
                // Delete file from storage if it exists
                if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                
                // Delete database record
                $image->delete();
                $deletedCount++;
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} images permanently",
                'deleted_count' => $deletedCount
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete images: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Archive a project.
     */
    public function archiveProject($id)
    {
        try {
            // Find the project manually
            $project = \App\Models\Project::find($id);
            
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project not found'
                ], 404);
            }
            
            $updateResult = $project->update([
                'is_archive' => true,
            ]);
            
            if (!$updateResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update project'
                ], 500);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Project archived successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive project: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Unarchive a project.
     */
    public function unarchiveProject($id)
    {
        try {
            // Find the project manually
            $project = \App\Models\Project::find($id);
            
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project not found'
                ], 404);
            }
            
            $project->update([
                'is_archive' => false,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Project unarchived successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unarchive project: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Validate slash-separated engineer titles
     */
    private function validateEngineerTitles($titles)
    {
        if (empty($titles)) {
            return $titles;
        }
        
        $validTitles = ['RE', 'QE', 'PI', 'ME', 'Lab Tech/Lab Aide'];
        $titleArray = array_map('trim', explode(' / ', $titles));
        
        foreach ($titleArray as $title) {
            if (!empty($title) && !in_array($title, $validTitles)) {
                throw new \Illuminate\Validation\ValidationException(
                    validator()->make([], [])
                        ->errors()
                        ->add('engineer_title', "Invalid engineer title: {$title}. Valid titles are: " . implode(', ', $validTitles))
                );
            }
        }
        
        return $titles;
    }
}
