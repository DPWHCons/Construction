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
            // Add project_identifier field
            $table->string('project_identifier')->nullable()->after('project_id');
            
            // Add program_amount field
            $table->decimal('program_amount', 10, 2)->nullable()->after('contract_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_contracts', function (Blueprint $table) {
            $table->dropColumn(['project_identifier', 'program_amount']);
        });
    }
};
