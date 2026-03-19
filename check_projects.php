<?php

require_once 'vendor/autoload.php';

use App\Models\Project;

echo "Checking projects in database...\n";

$projects = Project::with('category')->where('project_year', 2026)->get();

foreach($projects as $project) {
    $contractId = $project->contract[0]->project_identifier ?? 'N/A';
    $categoryName = $project->category->name ?? 'N/A';
    
    echo "ID: {$project->id}, Title: {$project->title}, Contract: {$contractId}, Category: {$categoryName}\n";
}

echo "Total: " . $projects->count() . " projects\n";
