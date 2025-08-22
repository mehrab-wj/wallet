<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Calculate income sum
        $income = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->sum('amount');

        // Calculate expense sum
        $expense = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->sum('amount');

        // Calculate total (income - expense)
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
        ]);
    }
}
