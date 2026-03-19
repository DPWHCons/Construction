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
        Schema::dropIfExists('project_contracts');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('project_engineers');
        Schema::dropIfExists('engineer_titles');
        Schema::dropIfExists('engineers');
    }

    public function down(): void
    {
        // Recreate tables if needed (rollback)
        Schema::create('engineers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('engineer_titles', function (Blueprint $table) {
            $table->id();
            $table->string('title', 50)->unique();
            $table->timestamps();
        });

        Schema::create('project_engineers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('engineer_id')->constrained()->onDelete('cascade');
            $table->foreignId('title_id')->constrained()->onDelete('cascade');
            $table->unique(['project_id', 'engineer_id']);
            $table->timestamps();
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_code')->unique();
            $table->decimal('program_amount', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('project_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('contract_id')->nullable();
            $table->decimal('revised_cost', 10, 2)->nullable();
            $table->timestamps();
        });
    }
};
