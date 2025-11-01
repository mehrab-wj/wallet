<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Models\Budget;
use App\Models\BudgetAllocation;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_current_allocation_returns_fixed_amount(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->for($user)->fixed(750)->create();

        $allocation = $budget->getCurrentAllocation(Carbon::now());

        $this->assertEquals(750, $allocation);
    }

    public function test_get_current_allocation_returns_saved_allocation(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->for($user)->fixed(500)->create();
        $period = Carbon::now()->startOfMonth();

        // Create an allocation record using the model method
        $budget->allocateForPeriod($period);
        
        // Update it to 650
        $allocation = $budget->allocations()->whereDate('period', $period->format('Y-m-d'))->first();
        $allocation->update(['amount' => 650]);

        $allocationAmount = $budget->getCurrentAllocation(Carbon::now());

        $this->assertEquals(650, $allocationAmount);
    }

    public function test_get_current_allocation_calculates_percentage_from_previous_month(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $incomeCategory = Category::factory()->for($user)->income()->create();
        $budget = Budget::factory()->for($user)->percentage(15)->create();

        // Create income transactions in previous month
        $previousMonth = Carbon::now()->subMonth();
        Transaction::factory()->for($user)->for($account)->for($incomeCategory)->create([
            'type' => 'income',
            'amount' => 3000,
            'transaction_date' => $previousMonth->startOfMonth(),
        ]);

        $allocation = $budget->getCurrentAllocation(Carbon::now());

        // 15% of 3000 = 450
        $this->assertEquals(450, $allocation);
    }

    public function test_get_current_allocation_returns_zero_for_percentage_with_no_previous_income(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->for($user)->percentage(20)->create();

        $allocation = $budget->getCurrentAllocation(Carbon::now());

        $this->assertEquals(0, $allocation);
    }

    public function test_get_spent_amount_sums_expenses_from_budget_categories(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category1 = Category::factory()->for($user)->expense()->create();
        $category2 = Category::factory()->for($user)->expense()->create();
        $budget = Budget::factory()->for($user)->fixed(1000)->create();
        $budget->categories()->attach([$category1->id, $category2->id]);

        // Create transactions in current month
        Transaction::factory()->for($user)->for($account)->for($category1)->create([
            'type' => 'expense',
            'amount' => 200,
            'transaction_date' => Carbon::now(),
        ]);
        Transaction::factory()->for($user)->for($account)->for($category2)->create([
            'type' => 'expense',
            'amount' => 350,
            'transaction_date' => Carbon::now(),
        ]);

        $spent = $budget->getSpentAmount(Carbon::now());

        $this->assertEquals(550, $spent);
    }

    public function test_get_spent_amount_ignores_transactions_from_other_months(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category = Category::factory()->for($user)->expense()->create();
        $budget = Budget::factory()->for($user)->fixed(500)->create();
        $budget->categories()->attach($category);

        // Transaction from last month
        Transaction::factory()->for($user)->for($account)->for($category)->create([
            'type' => 'expense',
            'amount' => 100,
            'transaction_date' => Carbon::now()->subMonth(),
        ]);

        // Transaction from this month
        Transaction::factory()->for($user)->for($account)->for($category)->create([
            'type' => 'expense',
            'amount' => 200,
            'transaction_date' => Carbon::now(),
        ]);

        $spent = $budget->getSpentAmount(Carbon::now());

        $this->assertEquals(200, $spent);
    }

    public function test_get_spent_amount_ignores_income_transactions(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category = Category::factory()->for($user)->expense()->create();
        $budget = Budget::factory()->for($user)->fixed(500)->create();
        $budget->categories()->attach($category);

        // Expense transaction
        Transaction::factory()->for($user)->for($account)->for($category)->create([
            'type' => 'expense',
            'amount' => 150,
            'transaction_date' => Carbon::now(),
        ]);

        // Income transaction (should be ignored)
        Transaction::factory()->for($user)->for($account)->for($category)->create([
            'type' => 'income',
            'amount' => 500,
            'transaction_date' => Carbon::now(),
        ]);

        $spent = $budget->getSpentAmount(Carbon::now());

        $this->assertEquals(150, $spent);
    }

    public function test_get_spent_amount_returns_zero_for_budget_with_no_categories(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->for($user)->fixed(500)->create();

        $spent = $budget->getSpentAmount(Carbon::now());

        $this->assertEquals(0, $spent);
    }

    public function test_get_remaining_amount_calculates_correctly(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category = Category::factory()->for($user)->expense()->create();
        $budget = Budget::factory()->for($user)->fixed(1000)->create();
        $budget->categories()->attach($category);

        Transaction::factory()->for($user)->for($account)->for($category)->create([
            'type' => 'expense',
            'amount' => 300,
            'transaction_date' => Carbon::now(),
        ]);

        $remaining = $budget->getRemainingAmount(Carbon::now());

        $this->assertEquals(700, $remaining);
    }

    public function test_get_remaining_amount_can_be_negative_when_overspent(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category = Category::factory()->for($user)->expense()->create();
        $budget = Budget::factory()->for($user)->fixed(500)->create();
        $budget->categories()->attach($category);

        Transaction::factory()->for($user)->for($account)->for($category)->create([
            'type' => 'expense',
            'amount' => 700,
            'transaction_date' => Carbon::now(),
        ]);

        $remaining = $budget->getRemainingAmount(Carbon::now());

        $this->assertEquals(-200, $remaining);
    }

    public function test_allocate_for_period_creates_new_allocation(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->for($user)->fixed(800)->create();
        $period = Carbon::now()->startOfMonth();

        $allocation = $budget->allocateForPeriod($period);

        $this->assertInstanceOf(BudgetAllocation::class, $allocation);
        $this->assertEquals($budget->id, $allocation->budget_id);
        $this->assertEquals($period->format('Y-m-d'), $allocation->period->format('Y-m-d'));
        $this->assertEquals(800, $allocation->amount);
    }

    public function test_allocate_for_period_updates_existing_allocation(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->for($user)->fixed(600)->create();
        $period = Carbon::now()->startOfMonth();

        // Create initial allocation
        $firstAllocation = $budget->allocateForPeriod($period);

        // Update budget amount
        $budget->update(['amount_value' => 800]);

        // Allocate again for same period
        $secondAllocation = $budget->allocateForPeriod($period);

        $this->assertEquals($firstAllocation->id, $secondAllocation->id);
        $this->assertEquals(800, $secondAllocation->amount);
    }

    public function test_active_scope_filters_active_budgets(): void
    {
        $user = User::factory()->create();
        Budget::factory()->for($user)->create(['active' => true]);
        Budget::factory()->for($user)->create(['active' => true]);
        Budget::factory()->for($user)->inactive()->create();

        $activeBudgets = Budget::where('user_id', $user->id)->active()->get();

        $this->assertCount(2, $activeBudgets);
        $this->assertTrue($activeBudgets->every(fn ($budget) => $budget->active === true));
    }

    public function test_percentage_calculation_handles_multiple_income_transactions(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $incomeCategory = Category::factory()->for($user)->income()->create();
        $budget = Budget::factory()->for($user)->percentage(10)->create();

        // Create multiple income transactions in previous month
        $previousMonth = Carbon::now()->subMonth();
        Transaction::factory()->for($user)->for($account)->for($incomeCategory)->create([
            'type' => 'income',
            'amount' => 2000,
            'transaction_date' => $previousMonth->copy()->day(5),
        ]);
        Transaction::factory()->for($user)->for($account)->for($incomeCategory)->create([
            'type' => 'income',
            'amount' => 3000,
            'transaction_date' => $previousMonth->copy()->day(15),
        ]);
        Transaction::factory()->for($user)->for($account)->for($incomeCategory)->create([
            'type' => 'income',
            'amount' => 1500,
            'transaction_date' => $previousMonth->copy()->day(25),
        ]);

        $allocation = $budget->getCurrentAllocation(Carbon::now());

        // 10% of 6500 = 650
        $this->assertEquals(650, $allocation);
    }
}
