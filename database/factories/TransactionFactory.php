<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);
        $amount = fake()->randomFloat(2, 10, 1000);

        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => Category::factory(),
            'type' => $type,
            'input_amount' => $amount,
            'input_currency' => 'USD',
            'amount' => $amount,
            'rate' => 1.0,
            'label' => fake()->words(2, true),
            'description' => fake()->optional()->sentence(),
            'transaction_date' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
