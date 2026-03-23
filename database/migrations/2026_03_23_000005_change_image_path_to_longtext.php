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
        Schema::table('project_images', function (Blueprint $table) {
            // Change image_path from VARCHAR to LONGTEXT to store binary image data
            $table->longText('image_path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_images', function (Blueprint $table) {
            // Revert back to VARCHAR for file paths
            $table->string('image_path')->change();
        });
    }
};
