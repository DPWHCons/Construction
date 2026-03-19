<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create contracts table
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_code')->unique();
            $table->decimal('program_amount', 10, 2)->nullable();
            $table->timestamps();
        });

        // Create engineers table
        Schema::create('engineers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Create engineer_titles table
        Schema::create('engineer_titles', function (Blueprint $table) {
            $table->id();
            $table->string('title', 50)->unique();
            $table->timestamps();
        });

        // Insert default engineer titles
        DB::table('engineer_titles')->insert([
            ['title' => 'RE'],
            ['title' => 'QE'],
            ['title' => 'PI'],
            ['title' => 'ME'],
            ['title' => 'Lab Tech/Lab Aide'],
        ]);

        // Create project_engineers table
        Schema::create('project_engineers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('engineer_id')->constrained()->onDelete('cascade');
            $table->foreignId('title_id')->constrained('engineer_titles')->onDelete('cascade');
            $table->timestamps();

            // Prevent duplicate engineer-project assignments
            $table->unique(['project_id', 'engineer_id']);
        });

        // Create project_contracts table
        Schema::create('project_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('contract_id')->nullable()->constrained()->onDelete('cascade');
            $table->decimal('revised_cost', 10, 2)->nullable();
            $table->timestamps();
        });

        // Create project_scopes table
        Schema::create('project_scopes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('contractor_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('duration_cd')->nullable();
            $table->string('unit_of_measure')->nullable();
            $table->text('scope_of_work_main')->nullable();
            $table->timestamps();
        });

        // Create project_progress table
        Schema::create('project_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            
            // Target fields
            $table->decimal('target_planned', 10, 2)->nullable();
            $table->decimal('target_revised', 10, 2)->nullable();
            $table->decimal('target_actual', 10, 2)->nullable();
            
            // Physical accomplishment
            $table->decimal('physical_accomplishment_planned', 5, 2)->nullable();
            $table->decimal('physical_accomplishment_revised', 5, 2)->nullable();
            $table->decimal('physical_accomplishment_actual', 5, 2)->nullable();
            
            // Start dates
            $table->date('target_start_planned')->nullable();
            $table->date('target_start_revised')->nullable();
            $table->date('target_start_actual')->nullable();
            
            // Completion dates
            $table->date('target_completion_planned')->nullable();
            $table->date('target_completion_revised')->nullable();
            $table->date('target_completion_actual')->nullable();
            
            // Completion percentages
            $table->decimal('completion_percentage_planned', 5, 2)->nullable();
            $table->decimal('completion_percentage_actual', 5, 2)->nullable();
            $table->decimal('slippage', 5, 2)->nullable();
            
            $table->timestamps();
        });

        // Create project_remarks table
        Schema::create('project_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // Remove fields from projects table
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
                'target_planned',
                'target_revised',
                'target_actual',
                'physical_accomplishment_planned',
                'physical_accomplishment_revised',
                'physical_accomplishment_actual',
                'target_start_planned',
                'target_start_revised',
                'target_start_actual',
                'target_completion_planned',
                'target_completion_revised',
                'target_completion_actual',
                'completion_percentage_planned',
                'completion_percentage_actual',
                'slippage',
                'remarks'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add fields back to projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->string('project_identifier')->nullable();
            $table->string('contract_id')->nullable();
            $table->string('assigned_engineers')->nullable();
            $table->decimal('revised_project_cost', 10, 2)->nullable();
            $table->integer('duration_cd')->nullable();
            $table->string('project_engineer')->nullable();
            $table->string('contractor_name')->nullable();
            $table->string('unit_of_measure')->nullable();
            $table->text('scope_of_work_main')->nullable();
            $table->decimal('target_planned', 10, 2)->nullable();
            $table->decimal('target_revised', 10, 2)->nullable();
            $table->decimal('target_actual', 10, 2)->nullable();
            $table->decimal('physical_accomplishment_planned', 5, 2)->nullable();
            $table->decimal('physical_accomplishment_revised', 5, 2)->nullable();
            $table->decimal('physical_accomplishment_actual', 5, 2)->nullable();
            $table->date('target_start_planned')->nullable();
            $table->date('target_start_revised')->nullable();
            $table->date('target_start_actual')->nullable();
            $table->date('target_completion_planned')->nullable();
            $table->date('target_completion_revised')->nullable();
            $table->date('target_completion_actual')->nullable();
            $table->decimal('completion_percentage_planned', 5, 2)->nullable();
            $table->decimal('completion_percentage_actual', 5, 2)->nullable();
            $table->decimal('slippage', 5, 2)->nullable();
            $table->text('remarks')->nullable();
        });

        // Drop all the new tables and old assigned_engineers table
        Schema::dropIfExists('project_contracts');
        Schema::dropIfExists('project_scopes');
        Schema::dropIfExists('project_progress');
        Schema::dropIfExists('project_remarks');
        Schema::dropIfExists('project_engineers');
        Schema::dropIfExists('engineers');
        Schema::dropIfExists('engineer_titles');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('assigned_engineers');
    }
};
