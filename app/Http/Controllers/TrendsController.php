<?php

namespace App\Http\Controllers;

use App\Facades\ExchangeRate;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TrendsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $mainCurrency = $user->main_currency;

        $range = (int) $request->query('range', 6);
        if (! in_array($range, [3, 6, 12])) {
            $range = 6;
        }

        $endDate = Carbon::now()->endOfMonth();
        $startDate = Carbon::now()->subMonths($range - 1)->startOfMonth();

        // Pre-fill all months in range
        $months = [];
        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            $key = $current->format('Y-m');
            $months[$key] = [
                'month' => $current->format('M Y'),
                'income' => 0.0,
                'expense' => 0.0,
                'net' => 0.0,
            ];
            $current->addMonth();
        }

        // Query 1: Monthly income/expense totals grouped by month, type, currency
        $monthlyRaw = Transaction::selectRaw("strftime('%Y-%m', transactions.transaction_date) as ym, transactions.type, accounts.currency, SUM(transactions.amount) as sum_amount")
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->where('transactions.user_id', $user->id)
            ->whereBetween('transactions.transaction_date', [$startDate, $endDate])
            ->groupBy('ym', 'transactions.type', 'accounts.currency')
            ->get();

        foreach ($monthlyRaw as $row) {
            $converted = $this->convertToMainCurrency($row->sum_amount, $row->currency, $mainCurrency);
            if (isset($months[$row->ym])) {
                if ($row->type === 'income') {
                    $months[$row->ym]['income'] += $converted;
                } elseif ($row->type === 'expense') {
                    $months[$row->ym]['expense'] += $converted;
                }
            }
        }

        // Calculate net for each month
        foreach ($months as $key => &$month) {
            $month['net'] = $month['income'] - $month['expense'];
        }
        unset($month);

        $monthlyData = array_values($months);

        // Query 2: Monthly expense by category
        $categoryRaw = Transaction::selectRaw("strftime('%Y-%m', transactions.transaction_date) as ym, categories.name as category_name, accounts.currency, SUM(transactions.amount) as sum_amount")
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.transaction_date', [$startDate, $endDate])
            ->groupBy('ym', 'categories.name', 'accounts.currency')
            ->get();

        // Accumulate category totals for sorting
        $categoryTotals = [];
        $categoryMonthly = [];

        foreach ($categoryRaw as $row) {
            $converted = $this->convertToMainCurrency($row->sum_amount, $row->currency, $mainCurrency);
            $cat = $row->category_name;
            $ym = $row->ym;

            if (! isset($categoryTotals[$cat])) {
                $categoryTotals[$cat] = 0;
            }
            $categoryTotals[$cat] += $converted;

            if (! isset($categoryMonthly[$ym])) {
                $categoryMonthly[$ym] = [];
            }
            if (! isset($categoryMonthly[$ym][$cat])) {
                $categoryMonthly[$ym][$cat] = 0;
            }
            $categoryMonthly[$ym][$cat] += $converted;
        }

        // Sort categories by total descending, take top 7 + "Other"
        arsort($categoryTotals);
        $allCategories = array_keys($categoryTotals);
        $topCategories = array_slice($allCategories, 0, 7);
        $hasOther = count($allCategories) > 7;
        $categories = $hasOther ? [...$topCategories, 'Other'] : $topCategories;

        // Build categoryMonthlyData with all months pre-filled
        $categoryMonthlyData = [];
        foreach ($months as $key => $monthData) {
            $entry = ['month' => $monthData['month']];
            foreach ($topCategories as $cat) {
                $entry[$cat] = round($categoryMonthly[$key][$cat] ?? 0, 2);
            }
            if ($hasOther) {
                $otherTotal = 0;
                foreach (($categoryMonthly[$key] ?? []) as $cat => $amount) {
                    if (! in_array($cat, $topCategories)) {
                        $otherTotal += $amount;
                    }
                }
                $entry['Other'] = round($otherTotal, 2);
            }
            $categoryMonthlyData[] = $entry;
        }

        return Inertia::render('trends/trends', [
            'monthlyData' => $monthlyData,
            'categoryMonthlyData' => $categoryMonthlyData,
            'categories' => $categories,
            'mainCurrency' => $mainCurrency,
            'filters' => [
                'range' => $range,
            ],
        ]);
    }

    private function convertToMainCurrency(float $amount, string $currency, string $mainCurrency): float
    {
        if ($currency === $mainCurrency) {
            return $amount;
        }

        try {
            $rate = ExchangeRate::getRate($currency, $mainCurrency);

            return $amount * $rate;
        } catch (\Throwable $e) {
            return $amount;
        }
    }
}
