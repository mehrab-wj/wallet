<?php

namespace App\Http\Controllers;

use App\Facades\ExchangeRate;
use App\Http\Requests\TransactionRequest;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function store(TransactionRequest $request)
    {
        $validated = $request->validated();

        $account = Account::where('user_id', Auth::id())->find($validated['account_id']);
        $rate = 1;

        if ($validated['input_currency'] !== $account->currency) {
            $rate = ExchangeRate::getRate($validated['input_currency'], $account->currency);
        }

        $amount = $validated['input_amount'] * $rate;

        Transaction::create([
            'user_id' => Auth::id(),
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

        return redirect()->back();
    }

    public function update(TransactionRequest $request, Transaction $transaction)
    {
        // Ensure the transaction belongs to the authenticated user
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validated();

        $account = Account::where('user_id', Auth::id())->find($validated['account_id']);
        $rate = 1;

        if ($validated['input_currency'] !== $account->currency) {
            $rate = ExchangeRate::getRate($validated['input_currency'], $account->currency);
        }

        $amount = $validated['input_amount'] * $rate;

        $transaction->update([
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

        return redirect()->back();
    }

    public function destroy(Transaction $transaction)
    {
        // Ensure the transaction belongs to the authenticated user
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $transaction->delete();

        return redirect()->back();
    }
}
