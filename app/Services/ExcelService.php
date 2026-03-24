<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Category;
use App\Models\ProjectScope;
use App\Models\ProjectProgress;
use App\Models\ProjectRemark;
use App\Models\AssignedEngineer;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExcelService
{
    public static function exportProjects($filters = [])
    {
        $query = Project::with([
            'category',
            'scope',
            'progress' => function($q) {
                // Get only the latest progress record
                $q->orderBy('updated_at', 'desc')->limit(1);
            },
            'remarks',
            'assignedEngineers'
        ]);

        // Apply filters
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('category', function($subQuery) use ($searchTerm) {
                      $subQuery->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['year']) && $filters['year'] !== 'all') {
            $query->where('project_year', $filters['year']);
        }

        // Get all projects first
        $allProjects = $query->orderBy('created_at', 'asc')->get();
        
        // Group projects by year
        $projectsByYear = [];
        foreach ($allProjects as $project) {
            $year = $project->project_year ?? 'Unknown';
            if (!isset($projectsByYear[$year])) {
                $projectsByYear[$year] = [];
            }
            $projectsByYear[$year][] = $project;
        }

        // Create spreadsheet with multiple sheets
        $spreadsheet = new Spreadsheet();
        
        // Get all unique categories for sorting
        $allCategories = $allProjects->pluck('category.name')->unique()->filter()->sort()->values();
        
        $sheetIndex = 0;
        foreach ($projectsByYear as $year => $projects) {
            // Create new sheet for each year
            if ($sheetIndex > 0) {
                $sheet = $spreadsheet->createSheet();
            } else {
                $sheet = $spreadsheet->getActiveSheet();
            }
            
            $sheet->setTitle('Year ' . $year);
            
            // Add logo (if exists)
            self::addLogo($sheet);
            
            // Add main title
            $sheet->mergeCells('A2:Z2');
            $sheet->setCellValue('A2', 'PROJECT MANAGEMENT REPORT - ' . $year);
            $titleStyle = [
                'font' => [
                    'bold' => true,
                    'size' => 18,
                    'color' => ['rgb' => '2F5597'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7F3FF'],
                ],
            ];
            $sheet->getStyle('A2:Z2')->applyFromArray($titleStyle);
            
            // Add subtitle with date
            $sheet->mergeCells('A3:Z3');
            $sheet->setCellValue('A3', 'Generated on: ' . date('F d, Y h:i A'));
            $subtitleStyle = [
                'font' => [
                    'size' => 12,
                    'color' => ['rgb' => '666666'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ];
            $sheet->getStyle('A3:Z3')->applyFromArray($subtitleStyle);
            
            // Add filters info if applied
            $filterRow = 4;
            if (!empty(array_filter($filters))) {
                $filterText = 'Filters: ';
                if (!empty($filters['search'])) $filterText .= "Search: {$filters['search']} ";
                if (!empty($filters['status']) && $filters['status'] !== 'all') $filterText .= "Status: {$filters['status']} ";
                if (!empty($filters['category_id'])) $filterText .= "Category: {$filters['category_id']} ";
                if (!empty($filters['year']) && $filters['year'] !== 'all') $filterText .= "Year: {$filters['year']} ";
                
                $sheet->mergeCells('A4:Z4');
                $sheet->setCellValue('A4', $filterText);
                $sheet->getStyle('A4:Z4')->applyFromArray($subtitleStyle);
                $filterRow = 5;
            }

            // Sort projects by category
            $sortedProjects = collect($projects)->sortBy(function($project) {
                return $project->category ? $project->category->name : '';
            })->values();

            // Set up two-row header structure with merged cells
            $headerRow = 6; // Starting row for headers

            // First row - main headers (merged cells)
            $sheet->setCellValue('A' . $headerRow, 'Contract ID');
            $sheet->mergeCells('A' . $headerRow . ':A' . ($headerRow + 1));
            
            $sheet->setCellValue('B' . $headerRow, 'Project Name');
            $sheet->mergeCells('B' . $headerRow . ':B' . ($headerRow + 1));
            
            $sheet->setCellValue('C' . $headerRow, 'Project ID');
            $sheet->mergeCells('C' . $headerRow . ':C' . ($headerRow + 1));
            
            $sheet->setCellValue('D' . $headerRow, 'Project Year');
            $sheet->mergeCells('D' . $headerRow . ':D' . ($headerRow + 1));
            
            $sheet->setCellValue('E' . $headerRow, "Ph '000");
            $sheet->mergeCells('E' . $headerRow . ':H' . $headerRow);
            
            $sheet->setCellValue('I' . $headerRow, 'Scope of Work');
            $sheet->mergeCells('I' . $headerRow . ':L' . $headerRow);
            
            $sheet->setCellValue('M' . $headerRow, 'Target');
            $sheet->mergeCells('M' . $headerRow . ':M' . ($headerRow + 1));
            
            $sheet->setCellValue('N' . $headerRow, 'Start Date');
            $sheet->mergeCells('N' . $headerRow . ':N' . ($headerRow + 1));
            
            $sheet->setCellValue('O' . $headerRow, 'Completion Date');
            $sheet->mergeCells('O' . $headerRow . ':O' . ($headerRow + 1));
            
            $sheet->setCellValue('P' . $headerRow, 'REMARKS');
            $sheet->mergeCells('P' . $headerRow . ':P' . ($headerRow + 1));
            
            $sheet->setCellValue('Q' . $headerRow, 'Assigned Field Engineers');
            $sheet->mergeCells('Q' . $headerRow . ':Q' . ($headerRow + 1));

            // Second row - sub-headers
            $subHeaderRow = $headerRow + 1;
            
            // Ph '000 sub-headers
            $sheet->setCellValue('E' . $subHeaderRow, 'a) Program Amount (\'000)');
            $sheet->setCellValue('F' . $subHeaderRow, 'b) Project Cost (\'000)');
            $sheet->setCellValue('G' . $subHeaderRow, 'c) -');
            $sheet->setCellValue('H' . $subHeaderRow, 'd) Revised Project Cost (\'000)');
            
            // Scope of Work sub-headers
            $sheet->setCellValue('I' . $subHeaderRow, 'a) Duration, CD');
            $sheet->setCellValue('J' . $subHeaderRow, 'b) Project Engineer');
            $sheet->setCellValue('K' . $subHeaderRow, 'c) Contractor');
            $sheet->setCellValue('L' . $subHeaderRow, 'd) Scope of Work - Unit of Measure');
            
            // Target sub-headers
            $sheet->setCellValue('M' . $subHeaderRow, 'Actual');
            
            // Start sub-headers
            $sheet->setCellValue('N' . $subHeaderRow, 'Actual');
            
            // Completion sub-headers
            $sheet->setCellValue('O' . $subHeaderRow, 'Actual');

            // Style both header rows
            $headerStyle = [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 10,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2F5597'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                    'wrapText' => true,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'D0D0D0'],
                    ],
                ],
            ];
            
            // Apply style to both header rows
            $sheet->getStyle('A' . $headerRow . ':Z' . ($headerRow + 1))->applyFromArray($headerStyle);
            
            // Set row heights
            $sheet->getRowDimension($headerRow)->setRowHeight(25);
            $sheet->getRowDimension($subHeaderRow)->setRowHeight(30);

            // Add data rows grouped by category
            $dataRow = $headerRow + 2; // Start after two header rows
            $currentCategory = null;
            $categoryCount = 0;
            
            foreach ($sortedProjects as $index => $project) {
                $assignedEngineers = $project->assignedEngineers->map(function($engineer) {
                    return trim(($engineer->engineer_title ? $engineer->engineer_title . ': ' : '') . $engineer->engineer_name);
                })->filter()->implode('; ');

                // Add category separator if category changes
                $projectCategory = $project->category ? $project->category->name : 'Uncategorized';
                if ($currentCategory !== $projectCategory) {
                    if ($currentCategory !== null) {
                        // Add spacing row between categories
                        $dataRow++;
                    }
                    
                    // Add category header row
                    $sheet->mergeCells('A' . $dataRow . ':Q' . $dataRow);
                    $sheet->setCellValue('A' . $dataRow, strtoupper($projectCategory));
                    
                    $categoryStyle = [
                        'font' => [
                            'bold' => true,
                            'size' => 14,
                            'color' => ['rgb' => '2F5597'],
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'E7F3FF'],
                        ],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_LEFT,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                        'borders' => [
                            'outline' => [
                                'borderStyle' => Border::BORDER_MEDIUM,
                                'color' => ['rgb' => '2F5597'],
                            ],
                        ],
                    ];
                    $sheet->getStyle('A' . $dataRow . ':Q' . $dataRow)->applyFromArray($categoryStyle);
                    $sheet->getRowDimension($dataRow)->setRowHeight(25);
                    
                    $currentCategory = $projectCategory;
                    $categoryCount++;
                    $dataRow++;
                }

                $progress = $project->progress->first();

                $data = [
                    $project->contract_id,
                    $project->title,
                    $project->project_id,
                    $project->project_year,
                    $project->program_amount ?? 0,
                    $project->project_cost ?? 0,
                    '', // Column G - empty as per image
                    $project->revised_project_cost ?? 0,
                    $project->scope->first() ? $project->scope->first()->duration_cd : '',
                    $project->scope->first() ? $project->scope->first()->project_engineer : '',
                    $project->scope->first() ? $project->scope->first()->contractor_name : '',
                    $project->scope->first() ? ($project->scope->first()->scope_of_work_main . ($project->scope->first()->unit_of_measure ? ' - ' . $project->scope->first()->unit_of_measure : '')) : '',
                    $progress ? floatval($progress->target_actual ?? 0) : 0.00,
                    $progress ? (is_object($progress->target_start_actual) ? $progress->target_start_actual->format('d/m/Y') : ($progress->target_start_actual ?? '')) : '',
                    $progress ? (is_object($progress->target_completion_actual) ? $progress->target_completion_actual->format('d/m/Y') : ($progress->target_completion_actual ?? '')) : '',
                    $project->remarks->first() ? $project->remarks->first()->remarks : '',
                    $assignedEngineers,
                ];
                
                $sheet->fromArray($data, null, 'A' . $dataRow);
                
                // Apply alternating row colors
                if ($categoryCount % 2 == 0) {
                    $rowStyle = [
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F8F9FA'],
                        ],
                    ];
                    $sheet->getStyle('A' . $dataRow . ':Z' . $dataRow)->applyFromArray($rowStyle);
                }
                
                // Apply borders to data rows
                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'E0E0E0'],
                        ],
                    ],
                ];
                $sheet->getStyle('A' . $dataRow . ':Q' . $dataRow)->applyFromArray($borderStyle);
                
                $dataRow++;
            }

            // Format numeric columns
            $numericColumns = ['E', 'F', 'H', 'M'];
            foreach ($numericColumns as $column) {
                $sheet->getStyle($column . ($headerRow + 2) . ':' . $column . ($dataRow - 1))
                      ->getNumberFormat()
                      ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
            }
            
            // Format decimal columns
            $decimalColumns = [];
            foreach ($decimalColumns as $column) {
                $sheet->getStyle($column . ($headerRow + 2) . ':' . $column . ($dataRow - 1))
                      ->getNumberFormat()
                      ->setFormatCode(NumberFormat::FORMAT_NUMBER_00); // 2 decimals
            }

            // Auto-size columns with minimum width
            foreach (range('A', 'S') as $columnID) {
                $sheet->getColumnDimension($columnID)->setAutoSize(true);
                // Set minimum width for better readability
                if (in_array($columnID, ['B', 'L', 'R', 'S'])) {
                    $sheet->getColumnDimension($columnID)->setWidth(20);
                }
            }

            // Add summary at the bottom
            $summaryRow = $dataRow + 2;
            $sheet->mergeCells('A' . $summaryRow . ':S' . $summaryRow);
            $sheet->setCellValue('A' . $summaryRow, 'Total Projects in ' . $year . ': ' . count($projects) . ' | Generated: ' . date('Y-m-d H:i:s'));
            
            $summaryStyle = [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => '2F5597'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7F3FF'],
                ],
                'borders' => [
                    'outline' => [
                        'borderStyle' => Border::BORDER_MEDIUM,
                        'color' => ['rgb' => '2F5597'],
                    ],
                ],
            ];
            $sheet->getStyle('A' . $summaryRow . ':S' . $summaryRow)->applyFromArray($summaryStyle);
            $sheet->getRowDimension($summaryRow)->setRowHeight(25);

            // Set page setup for printing
            $sheet->getPageSetup()
                  ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
                  ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4)
                  ->setFitToWidth(1)
                  ->setFitToHeight(0);

            $sheetIndex++;
        }

        // Create temporary file
        $filename = 'projects_export_' . date('Y_m_d_H_i_s') . '.xlsx';
        $filepath = sys_get_temp_dir() . '/' . $filename;
        
        $writer = new Xlsx($spreadsheet);
        $writer->save($filepath);

        return response()->download($filepath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ])->deleteFileAfterSend(true);
    }

    public static function importProjects($file)
    {
        $imported = 0;
        $skipped = 0;
        $errors = [];
        
        try {
            $spreadsheet = IOFactory::load($file);
            $sheetCount = $spreadsheet->getSheetCount();
            
            DB::beginTransaction();
            
            for ($sheetIndex = 0; $sheetIndex < $sheetCount; $sheetIndex++) {
                $sheet = $spreadsheet->getSheet($sheetIndex);
                $sheetName = $sheet->getTitle();
                
                // Extract year from sheet name (format: "Year 2023")
                $year = preg_replace('/[^0-9]/', '', $sheetName);
                if (empty($year)) {
                    $year = date('Y'); // Default to current year
                }
                
                // Find the header row (look for "Contract ID" in column A)
                $headerRow = null;
                $highestRow = $sheet->getHighestDataRow();
                
                for ($row = 1; $row <= $highestRow; $row++) {
                    $cellValue = $sheet->getCell('A' . $row)->getValue();
                    if (stripos($cellValue, 'Contract ID') !== false) {
                        $headerRow = $row;
                        break;
                    }
                }
                
                if (!$headerRow) {
                    $errors[] = "Sheet '{$sheetName}': Could not find header row";
                    continue;
                }
                
                // Data starts after the two header rows
                $dataStartRow = $headerRow + 2;
                
                // Process each data row
                $currentCategory = null;
                $categoryCount = 0;
                
                for ($row = $dataStartRow; $row <= $highestRow; $row++) {
                    try {
                        $rowData = self::extractRowData($sheet, $row);
                        
                        // Check if this is a category row (merged cell with category name)
                        $cellA = trim($sheet->getCell('A' . $row)->getValue() ?? '');
                        $cellB = trim($sheet->getCell('B' . $row)->getValue() ?? '');
                        $cellC = trim($sheet->getCell('C' . $row)->getValue() ?? '');
                        
                        // Category rows typically have text in column A but are empty in columns B and C
                        // and the text spans the entire row (merged cells)
                        // Category names can be mixed case but are typically longer than 3 characters
                        // and don't look like contract IDs (which are usually numbers/letters combinations)
                        if (!empty($cellA) && empty($cellB) && empty($cellC) && 
                            strlen($cellA) > 3 && 
                            !preg_match('/^\d+[A-Z]*$/i', $cellA) && // Not a contract ID format
                            !preg_match('/^[A-Z]{2,}\d+$/', $cellA)) { // Not a project ID format
                            
                            // This looks like a category row
                            $currentCategory = trim($cellA);
                            continue; // Skip to next row
                        }
                        
                        // Skip empty rows
                        if (empty($rowData['contract_id']) && empty($rowData['title'])) {
                            $skipped++;
                            continue;
                        }
                        
                        // Use the current category detected
                        $categoryName = $currentCategory;
                        
                        // Validate required fields
                        if (empty($rowData['contract_id']) || empty($rowData['title'])) {
                            $errors[] = "Row {$row}: Missing required Contract ID or Project Name";
                            $skipped++;
                            continue;
                        }
                        
                        // Set the category for this project
                        $rowData['category_name'] = $categoryName;
                        
                        // Check for existing project
                        $existingProject = Project::where('contract_id', $rowData['contract_id'])
                            ->orWhere('project_id', $rowData['project_id'])
                            ->first();
                            
                        if ($existingProject) {
                            $hasChanges = false;
                            $changeDetails = [];
                            
                            if ($existingProject->title !== $rowData['title']) {
                                $hasChanges = true;
                                $changeDetails[] = 'title';
                            }
                            if ($existingProject->project_year !== $projectYear) {
                                $hasChanges = true;
                                $changeDetails[] = 'project_year';
                            }
                            if (($existingProject->project_cost ?? 0) !== ($rowData['project_cost'] ?? 0)) {
                                $hasChanges = true;
                                $changeDetails[] = 'project_cost';
                            }
                            if (($existingProject->program_amount ?? 0) !== ($rowData['program_amount'] ?? 0)) {
                                $hasChanges = true;
                                $changeDetails[] = 'program_amount';
                            }
                            if (($existingProject->revised_project_cost ?? 0) !== ($rowData['revised_project_cost'] ?? 0)) {
                                $hasChanges = true;
                                $changeDetails[] = 'revised_project_cost';
                            }
                            
                            // Check scope changes
                            $existingScope = $existingProject->scope->first();
                            if (!empty($rowData['duration_cd']) || !empty($rowData['project_engineer']) || 
                                !empty($rowData['contractor_name']) || !empty($rowData['scope_of_work_main']) || !empty($rowData['unit_of_measure'])) {
                                
                                if (!$existingScope || 
                                    $existingScope->duration_cd !== $rowData['duration_cd'] ||
                                    $existingScope->project_engineer !== $rowData['project_engineer'] ||
                                    $existingScope->contractor_name !== $rowData['contractor_name'] ||
                                    $existingScope->scope_of_work_main !== $rowData['scope_of_work_main'] ||
                                    $existingScope->unit_of_measure !== $rowData['unit_of_measure']) {
                                    $hasChanges = true;
                                    $changeDetails[] = 'scope';
                                }
                            }
                            
                            // Check progress changes
                            $existingProgress = $existingProject->progress->first();
                            $hasProgressData = !empty($rowData['target_planned']) || !empty($rowData['target_revised']) || 
                                              !empty($rowData['target_actual']) || !empty($rowData['target_start_actual']) || 
                                              !empty($rowData['target_completion_actual']);
                            
                            if ($hasProgressData) {
                                if (!$existingProgress || 
                                    $existingProgress->target_planned !== $rowData['target_planned'] ||
                                    $existingProgress->target_revised !== $rowData['target_revised'] ||
                                    $existingProgress->target_actual !== $rowData['target_actual'] ||
                                    $existingProgress->target_start_actual !== $rowData['target_start_actual'] ||
                                    $existingProgress->target_completion_actual !== $rowData['target_completion_actual']) {
                                    $hasChanges = true;
                                    $changeDetails[] = 'progress';
                                }
                            }
                            
                            // Check remarks changes
                            $existingRemarks = $existingProject->remarks->first();
                            if (!empty($rowData['remarks'])) {
                                if (!$existingRemarks || $existingRemarks->remarks !== $rowData['remarks']) {
                                    $hasChanges = true;
                                    $changeDetails[] = 'remarks';
                                }
                            }
                            
                            // Check assigned engineers changes
                            $existingEngineers = $existingProject->assignedEngineers->pluck('engineer_name')->toArray();
                            if (!empty($rowData['assigned_engineers'])) {
                                $newEngineers = self::parseAssignedEngineers($rowData['assigned_engineers']);
                                $newEngineerNames = array_column($newEngineers, 'engineer_name');
                                
                                if ($existingEngineers !== $newEngineerNames) {
                                    $hasChanges = true;
                                    $changeDetails[] = 'assigned_engineers';
                                }
                            }
                            
                            if ($hasChanges) {
                                // Update existing project with changes
                                self::updateProjectFromRowData($existingProject, $rowData, $projectYear);
                                $imported++;
                                $errors[] = "Row {$row}: Updated existing project (changed: " . implode(', ', $changeDetails) . ")";
                            } else {
                                // No changes - skip
                                $skipped++;
                                $errors[] = "Row {$row}: Skipped - no changes detected";
                            }
                            continue;
                        }
                        
                        // Create project
                        $project = self::createProjectFromRowData($rowData, $year);
                        $imported++;
                        
                    } catch (\Exception $e) {
                        $errors[] = "Row {$row}: " . $e->getMessage();
                        $skipped++;
                    }
                }
            }
            
            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Import error: ' . $e->getMessage());
            throw $e;
        }
        
        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors
        ];
    }
    
    private static function extractRowData($sheet, $row)
    {
        $scopeOfWorkMain = trim($sheet->getCell('L' . $row)->getValue() ?? '');
        
        // Parse scope of work with unit of measure
        $scopeOfWorkParts = [];
        $unitOfMeasure = '';
        
        if (!empty($scopeOfWorkMain)) {
            // Check if scope contains " - " separator for unit of measure
            if (strpos($scopeOfWorkMain, ' - ') !== false) {
                $parts = explode(' - ', $scopeOfWorkMain, 2);
                $scopeOfWorkParts['scope_of_work_main'] = $parts[0] ?? $scopeOfWorkMain;
                $scopeOfWorkParts['unit_of_measure'] = $parts[1] ?? '';
            } else {
                $scopeOfWorkParts['scope_of_work_main'] = $scopeOfWorkMain;
                $scopeOfWorkParts['unit_of_measure'] = '';
            }
        } else {
            $scopeOfWorkParts['scope_of_work_main'] = '';
            $scopeOfWorkParts['unit_of_measure'] = '';
        }
        
        return [
            'contract_id' => trim($sheet->getCell('A' . $row)->getValue() ?? ''),
            'title' => trim($sheet->getCell('B' . $row)->getValue() ?? ''),
            'project_id' => trim($sheet->getCell('C' . $row)->getValue() ?? ''),
            'project_year' => trim($sheet->getCell('D' . $row)->getValue() ?? ''),
            'program_amount' => self::parseNumeric($sheet->getCell('E' . $row)->getValue()),
            'project_cost' => self::parseNumeric($sheet->getCell('F' . $row)->getValue()),
            'revised_project_cost' => self::parseNumeric($sheet->getCell('H' . $row)->getValue()),
            'duration_cd' => trim($sheet->getCell('I' . $row)->getValue() ?? ''),
            'project_engineer' => trim($sheet->getCell('J' . $row)->getValue() ?? ''),
            'contractor_name' => trim($sheet->getCell('K' . $row)->getValue() ?? ''),
            'scope_of_work_main' => $scopeOfWorkParts['scope_of_work_main'],
            'unit_of_measure' => $scopeOfWorkParts['unit_of_measure'],
            'target_actual' => self::parseNumeric($sheet->getCell('M' . $row)->getValue()),
            'target_start_actual' => self::parseDate($sheet->getCell('N' . $row)->getValue()),
            'target_completion_actual' => self::parseDate($sheet->getCell('O' . $row)->getValue()),
            'remarks' => trim($sheet->getCell('P' . $row)->getValue() ?? ''),
            'assigned_engineers' => trim($sheet->getCell('Q' . $row)->getValue() ?? ''),
            'category_name' => null, // Will be set when processing category rows
        ];
    }
    
    private static function isCategoryRow($sheet, $row)
    {
        // Category rows have text in column A but are empty in columns B and C
        // and the text spans the entire row (merged cells)
        // Category names can be mixed case but are typically longer than 3 characters
        // and don't look like contract IDs (which are usually numbers/letters combinations)
        $cellA = trim($sheet->getCell('A' . $row)->getValue() ?? '');
        $cellB = trim($sheet->getCell('B' . $row)->getValue() ?? '');
        $cellC = trim($sheet->getCell('C' . $row)->getValue() ?? '');
        
        return !empty($cellA) && empty($cellB) && empty($cellC) && 
               strlen($cellA) > 3 && 
               !preg_match('/^\d+[A-Z]*$/i', $cellA) && // Not a contract ID format
               !preg_match('/^[A-Z]{2,}\d+$/', $cellA); // Not a project ID format
    }
    
    private static function parseNumeric($value)
    {
        if (empty($value)) return null;
        
        // Remove commas, currency symbols, and other formatting
        $cleaned = preg_replace('/[^0-9.-]/', '', (string)$value);
        return is_numeric($cleaned) ? (float)$cleaned : null;
    }
    
    private static function parseDate($value)
    {
        if (empty($value)) return null;
        
        // Handle Excel date format
        if (is_numeric($value)) {
            try {
                $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
                return $date->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        }
        
        // Handle string dates (d/m/Y format)
        $dateString = trim((string)$value);
        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateString, $matches)) {
            return "{$matches[3]}-{$matches[2]}-{$matches[1]}";
        }
        
        return null;
    }
    
    private static function createProjectFromRowData($rowData, $sheetYear)
    {
        // Determine project year
        $projectYear = !empty($rowData['project_year']) ? $rowData['project_year'] : $sheetYear;
        
        // Handle category
        $categoryId = null;
        if (!empty($rowData['category_name'])) {
            // Check if category with this name already exists (case-insensitive)
            $category = Category::whereRaw('LOWER(name) = LOWER(?)', [$rowData['category_name']])->first();
            
            if ($category) {
                // Use existing category
                $categoryId = $category->id;
            } else {
                // Create new category
                $category = Category::create(['name' => $rowData['category_name']]);
                $categoryId = $category->id;
            }
        }
        
        // Determine project status based on remarks
        $status = 'ongoing'; // Default status
        if (!empty($rowData['remarks'])) {
            $remarksLower = strtolower($rowData['remarks']);
            if (strpos($remarksLower, 'completed') !== false) {
                $status = 'completed';
            } elseif (strpos($remarksLower, 'suspended') !== false) {
                $status = 'pending';
            }
        }
        
        // Create project
        $project = Project::create([
            'title' => $rowData['title'],
            'project_year' => $projectYear,
            'project_cost' => $rowData['project_cost'] ?? 0,
            'program_amount' => $rowData['program_amount'],
            'revised_project_cost' => $rowData['revised_project_cost'],
            'contract_id' => $rowData['contract_id'],
            'project_id' => $rowData['project_id'],
            'status' => $status,
            'date_started' => now(),
            'category_id' => $categoryId,
        ]);
        
        // Create scope if any scope data exists
        if (!empty($rowData['duration_cd']) || !empty($rowData['project_engineer']) || 
            !empty($rowData['contractor_name']) || !empty($rowData['scope_of_work_main']) || !empty($rowData['unit_of_measure'])) {
            
            $project->scope()->create([
                'duration_cd' => $rowData['duration_cd'],
                'project_engineer' => $rowData['project_engineer'],
                'contractor_name' => $rowData['contractor_name'],
                'scope_of_work_main' => $rowData['scope_of_work_main'],
                'unit_of_measure' => $rowData['unit_of_measure'],
            ]);
        }
        
        // Create progress if any progress data exists
        $hasProgressData = !empty($rowData['target_actual']) || !empty($rowData['target_start_actual']) || 
                          !empty($rowData['target_completion_actual']);
        
        if ($hasProgressData) {
            $project->progress()->create([
                'target_actual' => $rowData['target_actual'],
                'target_start_actual' => $rowData['target_start_actual'],
                'target_completion_actual' => $rowData['target_completion_actual'],
            ]);
        }
        
        // Create remarks if provided
        if (!empty($rowData['remarks'])) {
            $project->remarks()->create([
                'remarks' => $rowData['remarks'],
            ]);
        }
        
        // Create assigned engineers if provided
        if (!empty($rowData['assigned_engineers'])) {
            $engineers = self::parseAssignedEngineers($rowData['assigned_engineers']);
            foreach ($engineers as $engineer) {
                $project->assignedEngineers()->create($engineer);
            }
        }
        
        return $project;
    }
    
    private static function updateProjectFromRowData($existingProject, $rowData, $sheetYear)
    {
        // Determine project year
        $projectYear = !empty($rowData['project_year']) ? $rowData['project_year'] : $sheetYear;
        
        // Handle category
        $categoryId = null;
        if (!empty($rowData['category_name'])) {
            // Check if category with this name already exists (case-insensitive)
            $category = Category::whereRaw('LOWER(name) = LOWER(?)', [$rowData['category_name']])->first();
            
            if ($category) {
                // Use existing category
                $categoryId = $category->id;
            } else {
                // Create new category
                $category = Category::create(['name' => $rowData['category_name']]);
                $categoryId = $category->id;
            }
        }
        
        // Determine project status based on remarks
        $status = 'ongoing'; // Default status
        if (!empty($rowData['remarks'])) {
            $remarksLower = strtolower($rowData['remarks']);
            if (strpos($remarksLower, 'completed') !== false) {
                $status = 'completed';
            } elseif (strpos($remarksLower, 'suspended') !== false) {
                $status = 'pending';
            }
        }
        
        // Update project
        $existingProject->update([
            'title' => $rowData['title'],
            'project_year' => $projectYear,
            'project_cost' => $rowData['project_cost'] ?? 0,
            'program_amount' => $rowData['program_amount'],
            'revised_project_cost' => $rowData['revised_project_cost'],
            'contract_id' => $rowData['contract_id'],
            'project_id' => $rowData['project_id'],
            'status' => $status,
            'category_id' => $categoryId,
        ]);
        
        // Update or create scope
        $existingScope = $existingProject->scope->first();
        if (!empty($rowData['duration_cd']) || !empty($rowData['project_engineer']) || 
            !empty($rowData['contractor_name']) || !empty($rowData['scope_of_work_main']) || !empty($rowData['unit_of_measure'])) {
            
            $scopeData = [
                'duration_cd' => $rowData['duration_cd'],
                'project_engineer' => $rowData['project_engineer'],
                'contractor_name' => $rowData['contractor_name'],
                'scope_of_work_main' => $rowData['scope_of_work_main'],
                'unit_of_measure' => $rowData['unit_of_measure'],
            ];
            
            if ($existingScope) {
                $existingScope->update($scopeData);
            } else {
                $existingProject->scope()->create($scopeData);
            }
        } elseif ($existingScope) {
            // Remove scope if no data
            $existingScope->delete();
        }
        
        // Update or create progress
        $existingProgress = $existingProject->progress->first();
        $hasProgressData = !empty($rowData['target_actual']) || !empty($rowData['target_start_actual']) || 
                          !empty($rowData['target_completion_actual']);
        
        if ($hasProgressData) {
            $progressData = [
                'target_actual' => $rowData['target_actual'],
                'target_start_actual' => $rowData['target_start_actual'],
                'target_completion_actual' => $rowData['target_completion_actual'],
            ];
            
            if ($existingProgress) {
                $existingProgress->update($progressData);
            } else {
                $existingProject->progress()->create($progressData);
            }
        } elseif ($existingProgress) {
            // Remove progress if no data
            $existingProgress->delete();
        }
        
        // Update or create remarks
        $existingRemarks = $existingProject->remarks->first();
        if (!empty($rowData['remarks'])) {
            $remarksData = ['remarks' => $rowData['remarks']];
            
            if ($existingRemarks) {
                $existingRemarks->update($remarksData);
            } else {
                $existingProject->remarks()->create($remarksData);
            }
        } elseif ($existingRemarks) {
            // Remove remarks if empty
            $existingRemarks->delete();
        }
        
        // Update assigned engineers
        $existingEngineers = $existingProject->assignedEngineers;
        if (!empty($rowData['assigned_engineers'])) {
            $newEngineers = self::parseAssignedEngineers($rowData['assigned_engineers']);
            
            // Remove existing engineers not in new list
            foreach ($existingEngineers as $existingEngineer) {
                if (!in_array($existingEngineer->engineer_name, array_column($newEngineers, 'engineer_name'))) {
                    $existingEngineer->delete();
                }
            }
            
            // Add or update engineers
            foreach ($newEngineers as $engineerData) {
                $existingEngineer = $existingEngineers->firstWhere('engineer_name', $engineerData['engineer_name']);
                if ($existingEngineer) {
                    $existingEngineer->update($engineerData);
                } else {
                    $existingProject->assignedEngineers()->create($engineerData);
                }
            }
        } elseif ($existingEngineers->count() > 0) {
            // Remove all engineers if empty
            foreach ($existingEngineers as $existingEngineer) {
                $existingEngineer->delete();
            }
        }
        
        return $existingProject;
    }
    
    private static function parseAssignedEngineers($engineersString)
    {
        $engineers = [];
        $engineerEntries = explode(';', $engineersString);
        
        foreach ($engineerEntries as $entry) {
            $entry = trim($entry);
            if (empty($entry)) continue;
            
            // Parse format: "Title: Name" or just "Name"
            if (strpos($entry, ':') !== false) {
                list($title, $name) = explode(':', $entry, 2);
                $engineers[] = [
                    'engineer_title' => trim($title),
                    'engineer_name' => trim($name),
                ];
            } else {
                $engineers[] = [
                    'engineer_title' => null,
                    'engineer_name' => trim($entry),
                ];
            }
        }
        
        return array_slice($engineers, 0, 4); // Limit to 4 engineers
    }

    private static function addLogo($sheet)
    {
        $logoPath = public_path('images/DPWH Logo  - 17 Gears.png');
        
        if (file_exists($logoPath)) {
            $drawing = new Drawing();
            $drawing->setName('Logo');
            $drawing->setDescription('DPWH Logo');
            $drawing->setPath($logoPath);
            $drawing->setHeight(60);
            $drawing->setCoordinates('A1');
            $drawing->setOffsetX(5);
            $drawing->setOffsetY(5);
            $drawing->setWorksheet($sheet);
            
            // Adjust row height for logo
            $sheet->getRowDimension(1)->setRowHeight(70);
        }
    }
}
