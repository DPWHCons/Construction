<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update the default admin user
        User::updateOrCreate(
            ['email' => 'admin'],
            [
                'name' => 'DPWH Administrator',
                'email' => 'admin',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Default admin user created successfully!');
        $this->command->info('Email: admin');
        $this->command->info('Password: admin123');
    }
}
