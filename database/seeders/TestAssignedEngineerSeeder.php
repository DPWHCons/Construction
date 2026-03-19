<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AssignedEngineer;

class TestAssignedEngineerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add test assigned engineers for project ID 1
        AssignedEngineer::create([
            'project_id' => 1,
            'engineer_name' => 'Test Engineer 1',
            'engineer_title' => 'RE',
        ]);

        AssignedEngineer::create([
            'project_id' => 1,
            'engineer_name' => 'Test Engineer 2',
            'engineer_title' => 'QE',
        ]);
    }
}
