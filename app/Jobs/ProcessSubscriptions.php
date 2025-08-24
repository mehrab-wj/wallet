<?php

namespace App\Jobs;

use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\ExchangeRate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessSubscriptions implements ShouldQueue
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
    public function handle(ExchangeRate $exchangeRate): void
    {
        // Get all subscriptions that are due today
        $subscriptions = Subscription::dueToday()
            ->with(['user', 'account', 'category'])
            ->get();

        foreach ($subscriptions as $subscription) {
            try {
                $this->processSubscription($subscription, $exchangeRate);
            } catch (\Exception $e) {
                Log::error("Failed to process subscription ID: {$subscription->id}. Error: {$e->getMessage()}");
                // Continue processing other subscriptions even if one fails
            }
        }
    }

    /**
     * Process a single subscription and create a transaction.
     */
    private function processSubscription(Subscription $subscription, ExchangeRate $exchangeRate): void
    {
        // Get the account's currency
        $accountCurrency = $subscription->account->currency;

        // Calculate the converted amount if currencies differ
        $rate = 1.0;
        $convertedAmount = $subscription->input_amount;

        if ($subscription->input_currency !== $accountCurrency) {
            $rate = $exchangeRate->getRate($subscription->input_currency, $accountCurrency);
            $convertedAmount = $exchangeRate->convert($subscription->input_currency, $accountCurrency, $subscription->input_amount);
        }

        // Create the transaction
        Transaction::create([
            'user_id' => $subscription->user_id,
            'account_id' => $subscription->account_id,
            'category_id' => $subscription->category_id,
            'type' => 'expense',
            'input_amount' => $subscription->input_amount,
            'input_currency' => $subscription->input_currency,
            'amount' => $convertedAmount,
            'rate' => $rate,
            'label' => $subscription->vendor,
            'description' => $subscription->description ?: "Subscription payment for {$subscription->vendor}",
            'transaction_date' => now(),
        ]);

        // Update the subscription's run dates
        $subscription->markAsProcessed();
    }
}
