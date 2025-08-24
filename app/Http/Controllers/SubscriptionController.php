<?php

namespace App\Http\Controllers;

use App\Facades\ExchangeRate;
use App\Http\Requests\SubscriptionRequest;
use App\Models\Account;
use App\Models\Category;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        $subscriptions = Subscription::where('user_id', Auth::id())
            ->with(['account', 'category'])
            ->orderBy('next_run_on')
            ->orderBy('vendor')
            ->get();

        $accounts = Account::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        $expenseCategories = Category::where('user_id', Auth::id())
            ->where('type', 'expense')
            ->orderBy('name')
            ->get();

        return Inertia::render('subscriptions/subscriptions', [
            'subscriptions' => $subscriptions,
            'accounts' => $accounts,
            'expenseCategories' => $expenseCategories,
        ]);
    }

    public function store(SubscriptionRequest $request)
    {
        $validated = $request->validated();

        $startsOn = \Carbon\Carbon::parse($validated['starts_on']);
        $today = \Carbon\Carbon::today();

        // Calculate initial values
        $lastRunOn = null;
        $nextRunOn = $startsOn;

        // If subscription starts today, create a transaction immediately
        if ($startsOn->equalTo($today)) {
            // Get the account for exchange rate calculation
            $account = Account::where('user_id', Auth::id())->find($validated['account_id']);

            // Calculate exchange rate and amount
            $rate = 1;
            if ($validated['input_currency'] !== $account->currency) {
                $rate = ExchangeRate::getRate($validated['input_currency'], $account->currency);
            }
            $amount = $validated['input_amount'] * $rate;

            // Create transaction
            $request->user()->transactions()->create([
                'account_id' => $validated['account_id'],
                'category_id' => $validated['category_id'],
                'type' => 'expense',
                'input_amount' => $validated['input_amount'],
                'input_currency' => $validated['input_currency'],
                'amount' => $amount,
                'rate' => $rate,
                'label' => $validated['vendor'],
                'description' => $this->getDescription($validated['description']),
                'transaction_date' => $today->format('Y-m-d'),
            ]);

            // Update subscription tracking
            $lastRunOn = $today;

            // Calculate next run date based on interval
            $nextRunOn = $this->calculateNextRunDate($startsOn, $validated['interval_unit']);
        }

        // Create subscription
        Subscription::create([
            'user_id' => Auth::id(),
            'account_id' => $validated['account_id'],
            'category_id' => $validated['category_id'],
            'vendor' => $validated['vendor'],
            'description' => $validated['description'] ?? null,
            'input_amount' => $validated['input_amount'],
            'input_currency' => $validated['input_currency'],
            'starts_on' => $validated['starts_on'],
            'next_run_on' => $nextRunOn,
            'last_run_on' => $lastRunOn,
            'interval_unit' => $validated['interval_unit'],
            'active' => $validated['active'] ?? true,
        ]);

        return redirect()->back();
    }

    /**
     * Calculate the next run date based on start date and interval unit.
     */
    private function calculateNextRunDate(\Carbon\Carbon $startDate, string $intervalUnit): \Carbon\Carbon
    {
        return match ($intervalUnit) {
            'day' => $startDate->copy()->addDay(),
            'week' => $startDate->copy()->addWeek(),
            'month' => $startDate->copy()->addMonth(),
            'year' => $startDate->copy()->addYear(),
            default => $startDate->copy()->addMonth(), // Default to monthly
        };
    }

    public function update(SubscriptionRequest $request, Subscription $subscription)
    {
        // Ensure the subscription belongs to the authenticated user
        if ($subscription->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validated();

        // If starts_on changed and subscription hasn't run yet, update next_run_on
        if (isset($validated['starts_on']) && $subscription->last_run_on === null) {
            $newStartsOn = \Carbon\Carbon::parse($validated['starts_on']);
            $today = \Carbon\Carbon::today();

            // If new start date is today and subscription hasn't run, create transaction
            if ($newStartsOn->equalTo($today)) {
                // Get the account for exchange rate calculation
                $account = Account::where('user_id', Auth::id())->find($validated['account_id'] ?? $subscription->account_id);

                // Calculate exchange rate and amount
                $rate = 1;
                $inputAmount = $validated['input_amount'] ?? $subscription->input_amount;
                $inputCurrency = $validated['input_currency'] ?? $subscription->input_currency;

                if ($inputCurrency !== $account->currency) {
                    $rate = ExchangeRate::getRate($inputCurrency, $account->currency);
                }
                $amount = $inputAmount * $rate;

                // Create transaction
                $request->user()->transactions()->create([
                    'account_id' => $validated['account_id'] ?? $subscription->account_id,
                    'category_id' => $validated['category_id'] ?? $subscription->category_id,
                    'type' => 'expense',
                    'input_amount' => $inputAmount,
                    'input_currency' => $inputCurrency,
                    'amount' => $amount,
                    'rate' => $rate,
                    'label' => $subscription->vendor,
                    'description' => $this->getDescription($validated['description']),
                    'transaction_date' => $today->format('Y-m-d'),
                ]);

                // Update subscription tracking
                $validated['last_run_on'] = $today;
                $validated['next_run_on'] = $this->calculateNextRunDate($newStartsOn, $validated['interval_unit'] ?? $subscription->interval_unit);
            } else {
                $validated['next_run_on'] = $validated['starts_on'];
            }
        }

        $subscription->update($validated);

        return redirect()->back();
    }

    public function destroy(Subscription $subscription)
    {
        // Ensure the subscription belongs to the authenticated user
        if ($subscription->user_id !== Auth::id()) {
            abort(403);
        }

        $subscription->delete();

        return redirect()->back();
    }

    public function getDescription(?string $description): string
    {
        return ($description ? $description . "\n\n" : "") . "This Transaction is created automatically by the system.";
    }
}
