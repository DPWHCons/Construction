<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;

class SecurityController extends Controller
{
    /**
     * Show the security login page.
     */
    public function showLoginPage()
    {
        $securityAuthenticated = session()->has('security_authenticated');
        
        return Inertia::render('SecurityPage', [
            'securityAuthenticated' => $securityAuthenticated,
        ]);
    }

    /**
     * Verify the security password.
     */
    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        // The security password - should be stored in .env in production
        $securityPassword = env('SECURITY_PASSWORD', 'CDO1stDEO_2026');

        if ($request->password === $securityPassword) {
            // Clear any existing security session first
            Session::forget('security_authenticated');
            
            // Only set session (no persistent cookie - requires login every visit)
            Session::put('security_authenticated', true);
            Session::save(); // Force session save to prevent race conditions
            
            return redirect()->route('landing');
        }

        return back()->withErrors([
            'password' => 'The security password is incorrect.',
        ]);
    }

    /**
     * Logout from security check.
     */
    public function logout()
    {
        Session::forget('security_authenticated');
        return redirect()->route('security.login');
    }
}
