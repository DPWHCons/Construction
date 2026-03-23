<?php

// Simple test script to check database and image upload
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Check database connection
    $pdo = DB::connection()->getPdo();
    echo "Database connection: OK\n";
    
    // Check if project_images table exists
    $tableExists = Schema::hasTable('project_images');
    echo "project_images table exists: " . ($tableExists ? "YES" : "NO") . "\n";
    
    if ($tableExists) {
        // Get column info
        $columns = DB::select("SHOW COLUMNS FROM project_images");
        echo "Columns:\n";
        foreach ($columns as $column) {
            echo "  - {$column->Field}: {$column->Type}\n";
        }
        
        // Count existing images
        $count = DB::table('project_images')->count();
        echo "Current image count: {$count}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
