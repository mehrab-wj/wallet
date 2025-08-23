<?php

namespace App\Http\Controllers;

use App\Facades\ExchangeRate;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Sum amounts grouped by account currency and transaction type, then convert to user's main currency
        $mainCurrency = $user->main_currency;

        // Accept an optional `date` query param (YYYY-MM-01) to scope data
        if ($requestedDate = $request->query('date')) {
            try {
                $baseDate = Carbon::parse($requestedDate);
            } catch (\Throwable $e) {
                $baseDate = Carbon::now();
            }
        } else {
            $baseDate = Carbon::now();
        }

        $currentMonthStart = $baseDate->copy()->startOfMonth();
        $currentMonthEnd = $baseDate->copy()->endOfMonth();

        $groupedSums = Transaction::selectRaw('transactions.type, accounts.currency, SUM(transactions.amount) as sum_amount')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->where('transactions.user_id', $user->id)
            ->whereBetween('transactions.transaction_date', [$currentMonthStart, $currentMonthEnd])
            ->groupBy('transactions.type', 'accounts.currency')
            ->get();

        $income = 0.0;
        $expense = 0.0;

        foreach ($groupedSums as $row) {
            $currency = $row->currency;
            $sumAmount = (float) $row->sum_amount;

            // Convert currency groups to the user's main currency
            if ($currency === $mainCurrency) {
                $converted = $sumAmount;
            } else {
                try {
                    $rate = ExchangeRate::getRate($currency, $mainCurrency);
                    $converted = $sumAmount * $rate;
                } catch (\Throwable $e) {
                    // If conversion fails for this currency group, skip it
                    continue;
                }
            }

            if ($row->type === 'income') {
                $income += $converted;
            } elseif ($row->type === 'expense') {
                $expense += $converted;
            }
        }

        // Calculate total (income - expense) in user's main currency
        $total = $income - $expense;

        // Get current month transactions
        $transactions = Transaction::where('user_id', $user->id)
            ->with(['account', 'category'])
            ->whereBetween('transaction_date', [$currentMonthStart, $currentMonthEnd])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get user's accounts and categories for the forms
        $accounts = $user->accounts()->orderBy('name')->get();
        $categories = $user->categories()->orderBy('type')->orderBy('sort_order')->orderBy('name')->get();

        return Inertia::render('dashboard', [
            'dashboardData' => [
                'income' => $income,
                'expense' => $expense,
                'total' => $total,
            ],
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
            'mainCurrency' => $mainCurrency,
            'selectedDate' => $baseDate->copy()->startOfMonth()->toDateString(),
        ]);
    }
}
