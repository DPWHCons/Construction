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
        Schema::table('project_contracts', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['contract_id']);
            
            // Change contract_id from bigint unsigned to string to store contract identifiers
            $table->string('contract_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_contracts', function (Blueprint $table) {
            // Revert back to bigint unsigned
            $table->unsignedBigInteger('contract_id')->nullable()->change();
            
            // Add back the foreign key constraint
            $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('cascade');
        });
    }
};
