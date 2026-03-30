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
        
        // TEMPORARILY DISABLED: Get project statistics without caching
        if ($year === 'all') {
            $totalProjects = Project::where('is_archive', false)->count();
            $completedProjects = Project::where('is_archive', false)->where('status', 'completed')->count();
            $ongoingProjects = Project::where('is_archive', false)->where('status', 'ongoing')->count();
            $pendingProjects = Project::where('is_archive', false)->where('status', 'pending')->count();
        } else {
            $totalProjects = Project::where('is_archive', false)->where('project_year', $year)->count();
            $completedProjects = Project::where('is_archive', false)->where('status', 'completed')->where('project_year', $year)->count();
            $ongoingProjects = Project::where('is_archive', false)->where('status', 'ongoing')->where('project_year', $year)->count();
            $pendingProjects = Project::where('is_archive', false)->where('status', 'pending')->where('project_year', $year)->count();
        }
        
        $stats = [
            'totalProjects' => $totalProjects,
            'ongoingProjects' => $ongoingProjects,
            'completedProjects' => $completedProjects,
            'pendingProjects' => $pendingProjects,
        ];
        
        // TEMPORARILY DISABLED: Get recent projects without caching
        $query = Project::with(['scope', 'progress', 'remarks'])
            ->where('is_archive', false)
            ->orderBy('date_started', 'desc')
            ->take(5);
            
        // Filter by year if specified and not 'all'
        if ($year !== 'all') {
            $query->where('project_year', $year);
        }
            
        $recentProjects = $query->get();
        
        // TEMPORARILY DISABLED: Monthly project counts without caching
        // Monthly project counts (last 12 months)
        $monthlyQuery = Project::where('is_archive', false)
            ->select(
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

        // Get available years without caching
        $availableYears = Project::where('is_archive', false)
            ->whereNotNull('project_year')
            ->where('project_year', '!=', 'Unknown Year')
            ->distinct()
            ->pluck('project_year')
            ->sortDesc()
            ->values();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentProjects' => $recentProjects,
            'monthlyData' => $last12Months,
            'selectedYear' => $year,
            'availableYears' => $availableYears,
        ]);
    }
}