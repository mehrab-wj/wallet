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
            ->where('status', 'completed')
            ->sum('amount');

        // Calculate expense sum
        $expense = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->where('status', 'completed')
            ->sum('amount');

        // Calculate total (income - expense)
        $total = $income - $expense;

        return Inertia::render('dashboard', [
            'dashboardData' => [
                'income' => $income,
                'expense' => $expense,
                'total' => $total,
            ],
        ]);
    }
}
