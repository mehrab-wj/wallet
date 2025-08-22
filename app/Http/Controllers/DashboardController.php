<?php

namespace App\Http\Controllers;

use App\Facades\ExchangeRate;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Sum amounts grouped by account currency and transaction type, then convert to user's main currency
        $mainCurrency = $user->main_currency;

        $groupedSums = Transaction::selectRaw('transactions.type, accounts.currency, SUM(transactions.amount) as sum_amount')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->where('transactions.user_id', $user->id)
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

        // Get recent transactions
        $transactions = Transaction::where('user_id', $user->id)
            ->with(['account', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Get user's accounts and categories for the forms
        $accounts = $user->accounts()->orderBy('name')->get();
        $categories = $user->categories()->orderBy('type')->orderBy('name')->get();

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
        ]);
    }
}
