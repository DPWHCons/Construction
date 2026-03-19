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
            // Add project_year column only if it doesn't exist
            if (!Schema::hasColumn('projects', 'project_year')) {
                $table->year('project_year')->nullable()->after('date_started');
            }
            
            // Update status enum to include pending
            $table->enum('status', ['pending', 'ongoing', 'completed'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('project_year');
            $table->enum('status', ['ongoing', 'completed'])->change();
        });
    }
};
