<?php

use App\Jobs\ProcessMonthlyBudgets;
use App\Jobs\ProcessSubscriptions;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the subscription processing job to run daily
Schedule::job(new ProcessSubscriptions)->daily();

// Schedule the monthly budget allocation job to run on the first day of each month
Schedule::job(new ProcessMonthlyBudgets)->monthlyOn(1, '00:00');
