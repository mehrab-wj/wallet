<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
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
        Gate::authorize('create', Account::class);

        $request->user()->accounts()->create($request->validated());

        return redirect()->back();
    }

    public function update(AccountRequest $request, Account $account)
    {
        Gate::authorize('update', $account);

        $account->update($request->validated());

        return redirect()->back();
    }

    public function destroy(Account $account)
    {
        Gate::authorize('delete', $account);

        $account->delete();

        return redirect()->back();
    }
}
