<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSessionActivity
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (Auth::check()) {
            $lastActivity = session('last_activity');
            $currentTime = now();
            
            // If no last activity recorded, set it
            if (!$lastActivity) {
                session(['last_activity' => $currentTime]);
            } else {
                // Check if session has expired (2 hours = 7200 seconds)
                $inactiveTime = $currentTime->diffInSeconds($lastActivity);
                $sessionTimeout = config('session.lifetime') * 60; // Convert minutes to seconds
                
                if ($inactiveTime >= $sessionTimeout) {
                    // Session expired, logout user
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    
                    return redirect()->route('login')->with('status', 'Your session has expired due to inactivity. Please log in again.');
                }
                
                // Update last activity time
                session(['last_activity' => $currentTime]);
            }
        }
        
        return $next($request);
    }
}
