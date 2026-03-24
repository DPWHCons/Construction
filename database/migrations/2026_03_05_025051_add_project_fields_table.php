<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Contract Information
            $table->string('project_id')->nullable();
            $table->string('contract_id')->nullable();
            $table->string('assigned_engineers')->nullable();
            
            // Financial Information
            $table->decimal('revised_project_cost', 10, 2)->nullable();
            
            // Scope of Work
            $table->integer('duration_cd')->nullable();
            $table->string('project_engineer')->nullable();
            $table->string('contractor_name')->nullable();
            $table->string('unit_of_measure')->nullable();
            $table->text('scope_of_work_main')->nullable();
            
            // Progress & Scope
            $table->decimal('target_actual', 10, 2)->nullable();
            $table->date('target_start_actual')->nullable();
            $table->date('target_completion_actual')->nullable();
            
            // Remarks
            $table->text('remarks')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'project_id',
                'contract_id', 
                'assigned_engineers',
                'revised_project_cost',
                'duration_cd',
                'project_engineer',
                'contractor_name',
                'unit_of_measure',
                'scope_of_work_main',
                'target_actual',
                'target_start_actual',
                'target_completion_actual',
                'remarks'
            ]);
        });
    }
};
