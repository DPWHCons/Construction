<?php

namespace App\Http\Controllers;

use App\Services\ExcelService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProjectExportController extends Controller
{
    /**
     * Export projects to Excel.
     */
    public function export(Request $request)
    {
        try {
            $filters = $request->only(['search', 'status', 'category_id', 'year']);
            
            return ExcelService::exportProjects($filters);
            
        } catch (\Exception $e) {
            Log::error('Excel Export Error: ' . $e->getMessage());
            
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Import projects from Excel file.
     */
    public function import(Request $request)
    {
        try {
            $request->validate([
                'excel_file' => 'required|file|mimes:xlsx,xls|max:10240', // Max 10MB
            ]);

            $file = $request->file('excel_file');
            $result = ExcelService::importProjects($file);
            
            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$result['imported']} projects. {$result['skipped']} rows were skipped.",
                'imported' => $result['imported'],
                'skipped' => $result['skipped'],
                'errors' => $result['errors'] ?? []
            ]);
            
        } catch (\Exception $e) {
            Log::error('Excel Import Error: ' . $e->getMessage());
            
            return response()->json(['error' => 'Import failed: ' . $e->getMessage()], 500);
        }
    }
}
