<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubscriptionRequest;
use App\Models\Account;
use App\Models\Category;
use App\Models\Subscription;
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

        // Calculate next_run_on based on starts_on and interval_unit
        $startsOn = \Carbon\Carbon::parse($validated['starts_on']);

        Subscription::create([
            'user_id' => Auth::id(),
            'account_id' => $validated['account_id'],
            'category_id' => $validated['category_id'],
            'vendor' => $validated['vendor'],
            'description' => $validated['description'] ?? null,
            'input_amount' => $validated['input_amount'],
            'input_currency' => $validated['input_currency'],
            'starts_on' => $validated['starts_on'],
            'next_run_on' => $validated['starts_on'], // First run on start date
            'interval_unit' => $validated['interval_unit'],
            'active' => $validated['active'] ?? true,
        ]);

        return redirect()->back();
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
            $validated['next_run_on'] = $validated['starts_on'];
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
}
