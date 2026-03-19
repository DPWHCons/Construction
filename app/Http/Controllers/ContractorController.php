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
        // Get unique contractors from project_scopes with project counts
        $query = DB::table('project_scopes')
            ->select(
                'contractor_name',
                DB::raw('COUNT(DISTINCT project_id) as projects_count'),
                DB::raw('MAX(contractor_id) as contractor_id')
            )
            ->where('contractor_name', '!=', '')
            ->whereNotNull('contractor_name')
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
                'id' => $item->contractor_id ?: 0, // Use 0 if no contractor_id
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
        // Update contractor names in project_scopes
        if ($request->has('new_name')) {
            DB::table('project_scopes')
                ->where('contractor_name', $contractorName)
                ->update(['contractor_name' => $request->new_name]);
        }

        return redirect()->route('contractors.index')
            ->with('success', 'Contractor name updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($contractorName)
    {
        // Clear contractor name from project_scopes (set to null/empty)
        DB::table('project_scopes')
            ->where('contractor_name', $contractorName)
            ->update(['contractor_name' => null]);

        return redirect()->route('contractors.index')
            ->with('success', 'Contractor removed from project scopes.');
    }

    /**
     * Archive the specified contractor.
     */
    public function archive($contractorName)
    {
        // Archive all project_scopes records for this contractor
        $updatedCount = DB::table('project_scopes')
            ->where('contractor_name', $contractorName)
            ->update([
                'is_archived' => true,
                'archived_at' => now(),
            ]);

        return redirect()->route('contractors.index')
            ->with('success', "Contractor '{$contractorName}' archived successfully. {$updatedCount} records updated.");
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
