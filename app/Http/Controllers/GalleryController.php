<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;

class GalleryController extends Controller
{
    public function index()
    {
        // Get all projects with their images for the gallery
        $projects = Project::with('images')
            ->whereHas('images') // Only get projects that have images
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'category' => $project->category,
                    'status' => $project->status,
                    'project_year' => $project->project_year,
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
