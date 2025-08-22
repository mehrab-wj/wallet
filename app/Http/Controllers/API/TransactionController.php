<?php

namespace App\Http\Controllers\API;

use App\Facades\ExchangeRate;
use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionRequest;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::where('user_id', Auth::id())
            ->with(['account', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'transactions' => $transactions,
        ]);
    }

    public function store(TransactionRequest $request)
    {
        $validated = $request->validated();

        $account = Account::where('user_id', Auth::id())->find($validated['account_id']);
        $rate = 1;

        if ($validated['input_currency'] !== $account->currency) {
            $rate = ExchangeRate::getRate($validated['input_currency'], $account->currency);
        }

        $amount = $validated['input_amount'] * $rate;

        $transaction = $request->user()->transactions()->create([
            'account_id' => $validated['account_id'],
            'category_id' => $validated['category_id'],
            'type' => $validated['type'],
            'input_amount' => $validated['input_amount'],
            'input_currency' => $validated['input_currency'],
            'amount' => $amount,
            'rate' => $rate,
            'label' => $validated['label'],
            'description' => $validated['description'],
            'transaction_date' => $validated['transaction_date'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'transaction' => $transaction,
        ]);
    }
}
