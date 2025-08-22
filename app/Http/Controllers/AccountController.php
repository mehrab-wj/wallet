<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        return Inertia::render('accounts/accounts', [
            'accounts' => $accounts,
        ]);
    }

    public function store(AccountRequest $request)
    {
        $request->user()->accounts()->create($request->validated());

        return redirect()->back();
    }

    public function update(AccountRequest $request, Account $account)
    {
        // Ensure the account belongs to the authenticated user
        if ($account->user_id !== Auth::id()) {
            abort(403);
        }

        $account->update($request->validated());

        return redirect()->back();
    }

    public function destroy(Account $account)
    {
        // Ensure the account belongs to the authenticated user
        if ($account->user_id !== Auth::id()) {
            abort(403);
        }

        $account->delete();

        return redirect()->back();
    }
}
