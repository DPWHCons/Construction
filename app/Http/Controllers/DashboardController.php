<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Contractor;
use App\Models\ProjectImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->get('year', 'all');
        
        // Cache key based on year filter
        $cacheKey = "dashboard_stats_{$year}";
        
        // Get project statistics with caching (5 minutes for stats)
        $stats = Cache::remember($cacheKey, 300, function () use ($year) {
            $totalProjects = Project::count();
            $completedProjects = Project::where('status', 'completed')->count();
            $ongoingProjects = Project::where('status', 'ongoing')->count();
            $pendingProjects = Project::where('status', 'pending')->count();
            
            // If specific year is selected, filter stats by year
            if ($year !== 'all') {
                $totalProjects = Project::where('project_year', $year)->count();
                $completedProjects = Project::where('status', 'completed')->where('project_year', $year)->count();
                $ongoingProjects = Project::where('status', 'ongoing')->where('project_year', $year)->count();
                $pendingProjects = Project::where('status', 'pending')->where('project_year', $year)->count();
            }
            
            return [
                'totalProjects' => $totalProjects,
                'ongoingProjects' => $ongoingProjects,
                'completedProjects' => $completedProjects,
                'pendingProjects' => $pendingProjects,
            ];
        });
        
        // Get recent projects with caching (2 minutes for recent projects)
        $recentProjectsCacheKey = "recent_projects_{$year}";
        $recentProjects = Cache::remember($recentProjectsCacheKey, 120, function () use ($year) {
            $query = Project::with(['scope', 'progress', 'remarks'])
                ->orderBy('date_started', 'desc')
                ->take(5);
                
            // Filter by year if specified and not 'all'
            if ($year !== 'all') {
                $query->where('project_year', $year);
            }
                
            return $query->get();
        });
        
        // Monthly project counts with caching (10 minutes for monthly data)
        $monthlyCacheKey = "monthly_data_{$year}";
        $last12Months = Cache::remember($monthlyCacheKey, 600, function () use ($year) {
            // Monthly project counts (last 12 months)
            $monthlyQuery = Project::select(
                    DB::raw('MONTH(date_started) as month'),
                    DB::raw('COUNT(*) as total'),
                    DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"),
                    DB::raw("SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing"),
                    DB::raw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending")
                );
                
            // Filter by year if specified
            if ($year !== 'all') {
                $monthlyQuery->where('project_year', $year);
            }
                
            $monthlyData = $monthlyQuery
                ->where('date_started', '>=', now()->subMonths(11)->startOfMonth())
                ->groupBy(DB::raw('MONTH(date_started)'))
                ->orderBy('month')
                ->get()
                ->map(function($item) {
                    $months = [
                        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'May', 6 => 'Jun',
                        7 => 'Jul', 8 => 'Aug', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
                    ];
                    return [
                        'month' => $months[$item->month],
                        'total' => $item->total,
                        'completed' => $item->completed,
                        'ongoing' => $item->ongoing,
                        'pending' => $item->pending,
                    ];
                });

            // Fill in missing months with 0
            $last12Months = collect();
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthName = $date->format('M');
                $data = $monthlyData->firstWhere('month', $monthName);
                $last12Months->push([
                    'month' => $monthName,
                    'total' => $data->total ?? 0,
                    'completed' => $data->completed ?? 0,
                    'ongoing' => $data->ongoing ?? 0,
                    'pending' => $data->pending ?? 0,
                ]);
            }
            
            return $last12Months;
        });

        // Get all available years from database with caching (30 minutes - doesn't change often)
        $availableYears = Cache::remember('available_years', 1800, function () {
            return Project::whereNotNull('project_year')
                ->where('project_year', '!=', 'Unknown Year')
                ->distinct()
                ->pluck('project_year')
                ->sortDesc()
                ->values();
        });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentProjects' => $recentProjects,
            'monthlyData' => $last12Months,
            'selectedYear' => $year,
            'availableYears' => $availableYears,
        ]);
    }
}