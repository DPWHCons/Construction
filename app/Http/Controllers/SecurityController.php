<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class SecurityController extends Controller
{
    /**
     * Show the security login page.
     */
    public function showLoginPage()
    {
        return Inertia::render('SecurityPage');
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
        $securityPassword = 'Cdo1st';

        if ($request->password === $securityPassword) {
            // Set session flag
            Session::put('security_authenticated', true);
            
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
