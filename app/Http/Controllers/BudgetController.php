<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Models\Budget;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index()
    {
        $now = Carbon::now();

        $budgets = Budget::where('user_id', Auth::id())
            ->with('categories')
            ->orderBy('name')
            ->get()
            ->map(function ($budget) use ($now) {
                return [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'amount_type' => $budget->amount_type,
                    'amount_value' => $budget->amount_value,
                    'active' => $budget->active,
                    'categories' => $budget->categories,
                    'allocated' => $budget->getCurrentAllocation($now),
                    'spent' => $budget->getSpentAmount($now),
                    'remaining' => $budget->getRemainingAmount($now),
                    'created_at' => $budget->created_at,
                    'updated_at' => $budget->updated_at,
                ];
            });

        $expenseCategories = Category::where('user_id', Auth::id())
            ->where('type', 'expense')
            ->orderBy('name')
            ->get();

        return Inertia::render('budgets/budgets', [
            'budgets' => $budgets,
            'expenseCategories' => $expenseCategories,
        ]);
    }

    public function store(BudgetRequest $request)
    {
        Gate::authorize('create', Budget::class);

        $validated = $request->validated();

        $budget = Budget::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'amount_type' => $validated['amount_type'],
            'amount_value' => $validated['amount_value'],
            'active' => $validated['active'] ?? true,
        ]);

        // Sync categories
        $budget->categories()->sync($validated['category_ids']);

        // Create initial allocation for current month
        $budget->allocateForPeriod(Carbon::now());

        return redirect()->back();
    }

    public function update(BudgetRequest $request, Budget $budget)
    {
        Gate::authorize('update', $budget);

        $validated = $request->validated();

        $budget->update([
            'name' => $validated['name'],
            'amount_type' => $validated['amount_type'],
            'amount_value' => $validated['amount_value'],
            'active' => $validated['active'] ?? $budget->active,
        ]);

        // Sync categories
        $budget->categories()->sync($validated['category_ids']);

        // Update allocation for current month if amount changed
        $budget->allocateForPeriod(Carbon::now());

        return redirect()->back();
    }

    public function destroy(Budget $budget)
    {
        Gate::authorize('delete', $budget);

        $budget->delete();

        return redirect()->back();
    }
}
