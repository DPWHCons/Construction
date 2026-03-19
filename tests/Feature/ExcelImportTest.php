<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\ExcelService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Project;
use App\Models\Category;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ExcelImportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that category rows are properly detected during import.
     */
    public function test_category_detection_during_import()
    {
        // Create a test Excel file with category structure
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Year 2024');

        // Add headers
        $sheet->setCellValue('A6', 'Contract ID');
        $sheet->setCellValue('B6', 'Project Name');
        $sheet->setCellValue('C6', 'Project ID');
        $sheet->setCellValue('D6', 'Project Year');
        // Add more header columns as needed...

        // Add sub-headers
        $sheet->setCellValue('A7', 'Contract ID');
        $sheet->setCellValue('B7', 'Project Name');
        $sheet->setCellValue('C7', 'Project ID');
        $sheet->setCellValue('D7', 'Project Year');

        // Add first category row (merged cell)
        $sheet->mergeCells('A8:Z8');
        $sheet->setCellValue('A8', 'CATEGORY ONE');

        // Add projects under first category
        $sheet->setCellValue('A9', '001');
        $sheet->setCellValue('B9', 'Project 1');
        $sheet->setCellValue('C9', 'P001');
        $sheet->setCellValue('D9', '2024');

        $sheet->setCellValue('A10', '002');
        $sheet->setCellValue('B10', 'Project 2');
        $sheet->setCellValue('C10', 'P002');
        $sheet->setCellValue('D10', '2024');

        // Add spacing row
        $sheet->setCellValue('A11', '');

        // Add second category row (merged cell)
        $sheet->mergeCells('A12:Z12');
        $sheet->setCellValue('A12', 'CATEGORY TWO');

        // Add projects under second category
        $sheet->setCellValue('A13', '003');
        $sheet->setCellValue('B13', 'Project 3');
        $sheet->setCellValue('C13', 'P003');
        $sheet->setCellValue('D13', '2024');

        $sheet->setCellValue('A14', '004');
        $sheet->setCellValue('B14', 'Project 4');
        $sheet->setCellValue('C14', 'P004');
        $sheet->setCellValue('D14', '2024');

        // Save the file
        $filename = 'test_import.xlsx';
        $filepath = sys_get_temp_dir() . '/' . $filename;
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($filepath);

        // Create UploadedFile object
        $uploadedFile = new UploadedFile(
            $filepath,
            $filename,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        // Import the file
        $result = ExcelService::importProjects($uploadedFile);

        // Assertions
        $this->assertEquals(4, $result['imported']);
        $this->assertEquals(1, $result['skipped']); // The empty spacing row should be skipped

        // Check that categories were created
        $category1 = Category::where('name', 'CATEGORY ONE')->first();
        $category2 = Category::where('name', 'CATEGORY TWO')->first();

        $this->assertNotNull($category1);
        $this->assertNotNull($category2);

        // Check that projects are assigned to correct categories
        $projectsCat1 = Project::where('category_id', $category1->id)->get();
        $projectsCat2 = Project::where('category_id', $category2->id)->get();

        $this->assertEquals(2, $projectsCat1->count());
        $this->assertEquals(2, $projectsCat2->count());

        // Verify specific projects are in correct categories
        $this->assertEquals('Project 1', $projectsCat1->first()->title);
        $this->assertEquals('Project 3', $projectsCat2->first()->title);

        // Clean up
        unlink($filepath);
    }

    /**
     * Test that the isCategoryRow method works correctly.
     */
    public function test_is_category_row_detection()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Test category row
        $sheet->mergeCells('A1:Z1');
        $sheet->setCellValue('A1', 'TEST CATEGORY');
        $this->assertTrue($this->callPrivateMethod(ExcelService::class, 'isCategoryRow', [$sheet, 1]));

        // Test regular project row
        $sheet->setCellValue('A2', '001');
        $sheet->setCellValue('B2', 'Project Name');
        $sheet->setCellValue('C2', 'P001');
        $this->assertFalse($this->callPrivateMethod(ExcelService::class, 'isCategoryRow', [$sheet, 2]));

        // Test empty row
        $sheet->setCellValue('A3', '');
        $sheet->setCellValue('B3', '');
        $sheet->setCellValue('C3', '');
        $this->assertFalse($this->callPrivateMethod(ExcelService::class, 'isCategoryRow', [$sheet, 3]));
    }

    /**
     * Helper method to call private methods for testing.
     */
    private function callPrivateMethod($class, $methodName, $parameters = [])
    {
        $reflection = new \ReflectionClass($class);
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs(null, $parameters);
    }
}
