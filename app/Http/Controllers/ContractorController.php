<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ContractorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get unique contractors from project_scopes with project counts, excluding archived ones
        $query = DB::table('project_scopes')
            ->select(
                'contractor_name',
                DB::raw('COUNT(DISTINCT project_id) as projects_count'),
                DB::raw('MAX(contractor_id) as contractor_id')
            )
            ->where('contractor_name', '!=', '')
            ->whereNotNull('contractor_name')
            ->where('is_archived', false) // Only show non-archived contractors
            ->groupBy('contractor_name')
            ->orderBy('contractor_name');

        // Search by contractor name
        if ($request->search) {
            $query->where('contractor_name', 'LIKE', '%' . $request->search . '%');
        }

        $contractors = $query->paginate(10);

        // Transform the data to match the expected format
        $contractors->getCollection()->transform(function ($item) {
            return [
                'id' => $item->contractor_id ?: 'contractor_' . md5($item->contractor_name), // Use unique hash if no contractor_id
                'name' => $item->contractor_name,
                'projects_count' => $item->projects_count,
                'contact_number' => null,
                'address' => null,
            ];
        });

        return Inertia::render('Contractors', [
            'contractors' => $contractors,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Since we're using project_scopes, we don't need a create form
        // Contractors are created when they are assigned to project scopes
        return Inertia::render('Contractors', [
            'message' => 'Contractors are managed through project scopes'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Contractors are created through project scopes, not directly
        return redirect()->route('contractors.index')
            ->with('info', 'Contractors are managed through project scopes');
    }

    /**
     * Display the specified resource.
     */
    public function show($contractorName)
    {
        // Get projects for this contractor from project_scopes
        $projects = DB::table('project_scopes')
            ->join('projects', 'project_scopes.project_id', '=', 'projects.id')
            ->where('project_scopes.contractor_name', $contractorName)
            ->select('projects.*', 'project_scopes.scope_of_work_main')
            ->get();

        return Inertia::render('Contractors', [
            'contractor' => [
                'name' => $contractorName,
                'projects' => $projects
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($contractorName)
    {
        // Contractors are managed through project scopes
        return Inertia::render('Contractors', [
            'message' => 'Contractors are managed through project scopes'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $contractorName)
    {
        // Validate input
        $validated = $request->validate([
            'new_name' => 'required|string|max:255|min:2',
        ]);
        
        // Check if new name is different from current name
        if ($validated['new_name'] === $contractorName) {
            return redirect()->route('contractors.index')
                ->with('info', 'No changes made to contractor name.');
        }
        
        try {
            // Check if new name already exists
            $existing = DB::table('project_scopes')
                ->where('contractor_name', $validated['new_name'])
                ->where('contractor_name', '!=', $contractorName)
                ->exists();
            
            if ($existing) {
                return redirect()->route('contractors.index')
                    ->with('error', 'A contractor with this name already exists.');
            }
            
            // Update contractor names in project_scopes
            $updatedCount = DB::table('project_scopes')
                ->where('contractor_name', $contractorName)
                ->update(['contractor_name' => $validated['new_name']]);
            
            return redirect()->route('contractors.index')
                ->with('success', "Contractor '{$contractorName}' renamed to '{$validated['new_name']}'. {$updatedCount} records updated.");
        } catch (\Exception $e) {
            \Log::error('Error updating contractor', ['error' => $e->getMessage()]);
            return redirect()->route('contractors.index')
                ->with('error', 'Failed to update contractor: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($contractorName)
    {
        try {
            // Validate contractor exists
            $exists = DB::table('project_scopes')
                ->where('contractor_name', $contractorName)
                ->exists();
            
            if (!$exists) {
                return redirect()->route('contractors.index')
                    ->with('error', 'Contractor not found.');
            }
            
            // Clear contractor name from project_scopes (set to null/empty)
            $updatedCount = DB::table('project_scopes')
                ->where('contractor_name', $contractorName)
                ->update(['contractor_name' => null]);

            return redirect()->route('contractors.index')
                ->with('success', "Contractor '{$contractorName}' removed from {$updatedCount} project records.");
        } catch (\Exception $e) {
            \Log::error('Error deleting contractor', ['error' => $e->getMessage()]);
            return redirect()->route('contractors.index')
                ->with('error', 'Failed to remove contractor: ' . $e->getMessage());
        }
    }

    /**
     * Archive the specified contractor.
     */
    public function archive($contractorName)
    {
        try {
            // Validate contractor exists
            $exists = DB::table('project_scopes')
                ->where('contractor_name', $contractorName)
                ->where('is_archived', false)
                ->exists();
            
            if (!$exists) {
                return redirect()->route('contractors.index')
                    ->with('error', 'Contractor not found or already archived.');
            }
            
            // Archive all project_scopes records for this contractor
            $updatedCount = DB::table('project_scopes')
                ->where('contractor_name', $contractorName)
                ->update([
                    'is_archived' => true,
                    'archived_at' => now(),
                ]);

            return redirect()->route('contractors.index')
                ->with('success', "Contractor '{$contractorName}' archived successfully. {$updatedCount} records updated.");
        } catch (\Exception $e) {
            \Log::error('Error archiving contractor', ['error' => $e->getMessage()]);
            return redirect()->route('contractors.index')
                ->with('error', 'Failed to archive contractor: ' . $e->getMessage());
        }
    }

    /**
     * Restore the specified contractor.
     */
    public function restore($contractorName)
    {
        // Restore all project_scopes records for this contractor
        $updatedCount = DB::table('project_scopes')
            ->where('contractor_name', $contractorName)
            ->where('is_archived', true)
            ->update([
                'is_archived' => false,
                'archived_at' => null,
            ]);

        return redirect()->route('contractors.index')
            ->with('success', "Contractor '{$contractorName}' restored successfully. {$updatedCount} records updated.");
    }
}
