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
        Schema::table('project_images', function (Blueprint $table) {
            // Change image_path to LONGBLOB for binary data storage
            $table->binary('image_path', 'longBlob')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_images', function (Blueprint $table) {
            // Revert back to LONGTEXT
            $table->longText('image_path')->nullable()->change();
        });
    }
};
