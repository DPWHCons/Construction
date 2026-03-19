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
        Schema::table('project_scopes', function (Blueprint $table) {
            $table->string('project_engineer')->nullable();
            $table->string('contractor_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_scopes', function (Blueprint $table) {
            $table->dropColumn(['project_engineer', 'contractor_name']);
        });
    }
};
