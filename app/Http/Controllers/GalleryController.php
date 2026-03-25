<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;

class GalleryController extends Controller
{
    public function index()
    {
        // Get all projects with their images for the gallery (only non-archived)
        $projects = Project::with([
            'images' => function($query) {
                $query->where('is_archived', false); // Only get non-archived images
            }, 
            'category', 
            'scope'
        ])
            ->whereHas('images', function($query) {
                $query->where('is_archived', false); // Only projects with non-archived images
            })
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'category' => $project->category,
                    'status' => $project->status,
                    'project_year' => $project->project_year,
                    'contract_id' => $project->contract_id,
                    'project_id' => $project->project_id,
                    'scope' => $project->scope,
                    'images' => $project->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'image_path' => $image->image_path,
                            'filename' => $image->filename,
                            'document' => $image->document,
                            'caption' => $image->caption ?? null,
                            'created_at' => $image->created_at,
                        ];
                    }),
                    'updated_at' => $project->updated_at,
                ];
            });

        return Inertia::render('Gallery', [
            'projects' => $projects,
        ]);
    }
}
