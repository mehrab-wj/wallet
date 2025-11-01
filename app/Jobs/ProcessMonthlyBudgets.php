<?php

namespace App\Jobs;

use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessMonthlyBudgets implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $now = Carbon::now();

        // Get all active budgets
        $budgets = Budget::active()->get();

        foreach ($budgets as $budget) {
            try {
                // Create allocation for the current month
                $budget->allocateForPeriod($now);
            } catch (\Exception $e) {
                Log::error("Failed to allocate budget ID: {$budget->id}. Error: {$e->getMessage()}");
                // Continue processing other budgets even if one fails
            }
        }
    }
}
