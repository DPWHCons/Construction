<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSecurityPassword
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the user has already entered the security password (session or cookie)
        $isAuthenticated = session()->has('security_authenticated') || 
                          $request->cookie('security_authenticated') === 'true';

        if (!$isAuthenticated) {
            return redirect()->route('security.login');
        }

        // If authenticated via cookie, also set session for current request
        if ($request->cookie('security_authenticated') === 'true' && !session()->has('security_authenticated')) {
            session()->put('security_authenticated', true);
        }

        return $next($request);
    }
}
