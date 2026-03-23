<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to change column to LONGBLOB
        DB::statement('ALTER TABLE project_images MODIFY COLUMN image_path LONGBLOB');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to LONGTEXT
        DB::statement('ALTER TABLE project_images MODIFY COLUMN image_path LONGTEXT');
    }
};
