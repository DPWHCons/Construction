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
        Schema::table('categories', function (Blueprint $table) {
            // Add missing columns only if they don't exist
            if (!Schema::hasColumn('categories', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            if (!Schema::hasColumn('categories', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('description');
            }
            if (!Schema::hasColumn('categories', 'updated_by')) {
                $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null')->after('created_by');
            }
            if (!Schema::hasColumn('categories', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('updated_by');
            }
            if (!Schema::hasColumn('categories', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('is_archived');
            }
            
            // Remove unique constraint from name if it exists
            $table->dropUnique(['name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['description', 'created_by', 'updated_by', 'is_archived', 'archived_at']);
            $table->unique('name');
        });
    }
};
