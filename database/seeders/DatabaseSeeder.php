<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Mehrab',
            'email' => 'test@forgelink.co',
            'password' => Hash::make('123456789'),
        ]);

        Event::dispatch(new Registered($user));

        // User::factory(10)->create()->each(function ($user) {
        //     Event::dispatch(new Registered($user));
        // });
    }
}
