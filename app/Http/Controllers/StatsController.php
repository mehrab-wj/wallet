<?php

namespace App\Http\Controllers;

use App\Facades\ExchangeRate;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $mainCurrency = $user->main_currency;

        // Filter Parameters
        $type = $request->query('type', 'expense'); // Default to expense
        if (! in_array($type, ['income', 'expense'])) {
            $type = 'expense';
        }

        $dateParam = $request->query('date');
        try {
            $baseDate = $dateParam ? Carbon::parse($dateParam) : Carbon::now();
        } catch (\Throwable $e) {
            $baseDate = Carbon::now();
        }

        $startOfMonth = $baseDate->copy()->startOfMonth();
        $endOfMonth = $baseDate->copy()->endOfMonth();

        // --- 1. Category Stats (Donut Chart) ---
        // Group by category and currency to handle conversions
        $categoryDataRaw = Transaction::selectRaw('categories.name as category_name, categories.id as category_id, accounts.currency, SUM(transactions.amount) as total_amount')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', $type)
            ->whereBetween('transactions.transaction_date', [$startOfMonth, $endOfMonth])
            ->groupBy('categories.id', 'categories.name', 'accounts.currency')
            ->get();

        $categoryStats = [];
        foreach ($categoryDataRaw as $row) {
            $convertedAmount = $this->convertToMainCurrency($row->total_amount, $row->currency, $mainCurrency);
            
            $catId = $row->category_id;
            if (! isset($categoryStats[$catId])) {
                $categoryStats[$catId] = [
                    'name' => $row->category_name,
                    'value' => 0,
                    // You might want to assign colors here or on frontend
                ];
            }
            $categoryStats[$catId]['value'] += $convertedAmount;
        }
        
        // Format for Recharts (array of objects)
        $categoryChartData = array_values($categoryStats);
        // Sort by value desc
        usort($categoryChartData, fn($a, $b) => $b['value'] <=> $a['value']);

        // --- 2. Daily Stats (Area Chart) ---
        $dailyDataRaw = Transaction::selectRaw('transactions.transaction_date, accounts.currency, SUM(transactions.amount) as total_amount')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', $type) // Filter by type here too, or remove to show net? Requirement says "seperate them based on income or expense"
            ->whereBetween('transactions.transaction_date', [$startOfMonth, $endOfMonth])
            ->groupBy('transactions.transaction_date', 'accounts.currency')
            ->orderBy('transactions.transaction_date')
            ->get();

        $dailyStats = [];
        // Pre-fill all days in month with 0
        $daysInMonth = $startOfMonth->daysInMonth;
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dateStr = $startOfMonth->copy()->day($day)->toDateString();
            $dailyStats[$dateStr] = 0;
        }

        foreach ($dailyDataRaw as $row) {
            $convertedAmount = $this->convertToMainCurrency($row->total_amount, $row->currency, $mainCurrency);
            $dateStr = $row->transaction_date->toDateString(); // Ensure string format Y-m-d
            if (isset($dailyStats[$dateStr])) {
                $dailyStats[$dateStr] += $convertedAmount;
            }
        }

        // Format for Area Chart
        $dailyChartData = [];
        foreach ($dailyStats as $date => $value) {
            $dailyChartData[] = [
                'date' => $date,
                'day' => Carbon::parse($date)->format('j'), // Day number for X-axis
                'amount' => $value,
            ];
        }

        return Inertia::render('stats/stats', [
            'filters' => [
                'date' => $baseDate->toDateString(),
                'type' => $type,
            ],
            'categoryStats' => $categoryChartData,
            'dailyStats' => $dailyChartData,
            'mainCurrency' => $mainCurrency,
        ]);
    }

    private function convertToMainCurrency($amount, $currency, $mainCurrency)
    {
        if ($currency === $mainCurrency) {
            return (float) $amount;
        }

        try {
            $rate = ExchangeRate::getRate($currency, $mainCurrency);
            return (float) $amount * $rate;
        } catch (\Throwable $e) {
            return (float) $amount; // Fallback or handle error
        }
    }
}
