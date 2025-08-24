<?php

use App\Jobs\ProcessSubscriptions;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the subscription processing job to run daily at 9:00 AM
Schedule::job(new ProcessSubscriptions)->dailyAt('09:00');
