<?php

namespace Tests\Feature;

use App\Jobs\ProcessSubscriptions;
use App\Models\Account;
use App\Models\Category;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ExchangeRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcessSubscriptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_processes_subscriptions_due_today(): void
    {
        // Create a user with account and category
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category = Category::factory()->for($user)->expense()->create();

        // Create subscriptions - one due today, one not due
        $dueSubscription = Subscription::factory()
            ->for($user)
            ->for($account)
            ->for($category)
            ->dueToday()
            ->create([
                'vendor' => 'Netflix',
                'input_amount' => 15.99,
                'input_currency' => 'USD',
                'interval_unit' => 'month',
            ]);

        $notDueSubscription = Subscription::factory()
            ->for($user)
            ->for($account)
            ->for($category)
            ->dueTomorrow()
            ->create();

        // Mock the exchange rate service
        $this->mock(ExchangeRate::class, function ($mock) {
            $mock->shouldReceive('getRate')->andReturn(1.0);
            $mock->shouldReceive('convert')->andReturn(15.99);
        });

        // Execute the job
        $job = new ProcessSubscriptions;
        $job->handle(app(ExchangeRate::class));

        // Assert that a transaction was created for the due subscription
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'label' => 'Netflix',
            'input_amount' => 15.99,
            'input_currency' => 'USD',
        ]);

        // Assert that only one transaction was created
        $this->assertDatabaseCount('transactions', 1);

        // Assert that the subscription was updated
        $dueSubscription->refresh();
        $this->assertNotNull($dueSubscription->last_run_on);
        $this->assertTrue($dueSubscription->next_run_on->isAfter(today()));
    }

    public function test_does_not_process_inactive_subscriptions(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();
        $category = Category::factory()->for($user)->expense()->create();

        // Create an inactive subscription due today
        Subscription::factory()
            ->for($user)
            ->for($account)
            ->for($category)
            ->dueToday()
            ->inactive()
            ->create();

        // Mock the exchange rate service
        $this->mock(ExchangeRate::class);

        // Execute the job
        $job = new ProcessSubscriptions;
        $job->handle(app(ExchangeRate::class));

        // Assert that no transactions were created
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_handles_currency_conversion(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category = Category::factory()->for($user)->expense()->create();

        // Create subscription with different currency
        $subscription = Subscription::factory()
            ->for($user)
            ->for($account)
            ->for($category)
            ->dueToday()
            ->create([
                'input_amount' => 10.00,
                'input_currency' => 'EUR',
                'interval_unit' => 'month',
            ]);

        // Mock the exchange rate service
        $this->mock(ExchangeRate::class, function ($mock) {
            $mock->shouldReceive('getRate')
                ->with('EUR', 'USD')
                ->once()
                ->andReturn(1.1);
            $mock->shouldReceive('convert')
                ->with('EUR', 'USD', 10.00)
                ->once()
                ->andReturn(11.00);
        });

        // Execute the job
        $job = new ProcessSubscriptions;
        $job->handle(app(ExchangeRate::class));

        // Assert transaction was created with converted amount
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'input_amount' => 10.00,
            'input_currency' => 'EUR',
            'amount' => 11.00,
            'rate' => 1.1,
        ]);
    }

    public function test_calculates_next_run_date_correctly(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();
        $category = Category::factory()->for($user)->expense()->create();

        // Test monthly interval
        $monthlySubscription = Subscription::factory()
            ->for($user)
            ->for($account)
            ->for($category)
            ->create([
                'next_run_on' => today(),
                'interval_unit' => 'month',
                'active' => true,
            ]);

        // Test weekly interval
        $weeklySubscription = Subscription::factory()
            ->for($user)
            ->for($account)
            ->for($category)
            ->create([
                'next_run_on' => today(),
                'interval_unit' => 'week',
                'active' => true,
            ]);

        // Mock the exchange rate service
        $this->mock(ExchangeRate::class, function ($mock) {
            $mock->shouldReceive('getRate')->andReturn(1.0);
            $mock->shouldReceive('convert')->andReturn(10.0);
        });

        // Execute the job
        $job = new ProcessSubscriptions;
        $job->handle(app(ExchangeRate::class));

        // Check that next run dates were updated correctly
        $monthlySubscription->refresh();
        $weeklySubscription->refresh();

        $this->assertTrue($monthlySubscription->next_run_on->equalTo(today()->addMonth()));
        $this->assertTrue($weeklySubscription->next_run_on->equalTo(today()->addWeek()));
    }

    public function test_continues_processing_after_single_failure(): void
    {
        $user = User::factory()->create();

        // Create two accounts with same currency to avoid exchange rate calls
        $account1 = Account::factory()->for($user)->create(['currency' => 'USD']);
        $account2 = Account::factory()->for($user)->create(['currency' => 'USD']);
        $category = Category::factory()->for($user)->expense()->create();

        // Create two subscriptions due today - one will fail due to missing account relationship
        $subscription1 = Subscription::factory()
            ->for($user)
            ->for($account1)
            ->for($category)
            ->dueToday()
            ->create([
                'vendor' => 'Service 1',
                'input_currency' => 'USD', // Same as account currency
            ]);

        $subscription2 = Subscription::factory()
            ->for($user)
            ->for($account2)
            ->for($category)
            ->dueToday()
            ->create([
                'vendor' => 'Service 2',
                'input_currency' => 'USD', // Same as account currency
            ]);

        // Delete the first account to cause a failure when processing the first subscription
        $account1->delete();

        // Mock the exchange rate service (shouldn't be called since currencies match)
        $this->mock(ExchangeRate::class, function ($mock) {
            // No expectations since currencies are the same
        });

        // Execute the job
        $job = new ProcessSubscriptions;
        $job->handle(app(ExchangeRate::class));

        // Assert that one transaction was still created (for the second subscription)
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseHas('transactions', [
            'label' => 'Service 2',
        ]);
    }
}
