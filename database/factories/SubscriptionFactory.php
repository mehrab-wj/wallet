<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsOn = fake()->dateTimeBetween('-3 months', '+1 month');

        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => Category::factory()->expense(),
            'vendor' => fake()->company(),
            'description' => fake()->sentence(),
            'input_amount' => fake()->randomFloat(2, 5, 200),
            'input_currency' => fake()->randomElement(['USD', 'EUR', 'GBP', 'CAD']),
            'starts_on' => $startsOn,
            'next_run_on' => $startsOn,
            'last_run_on' => null,
            'interval_unit' => fake()->randomElement(['day', 'week', 'month', 'year']),
            'active' => true,
        ];
    }

    /**
     * Indicate that the subscription is due today.
     */
    public function dueToday(): static
    {
        return $this->state(fn (array $attributes) => [
            'next_run_on' => today(),
            'active' => true,
        ]);
    }

    /**
     * Indicate that the subscription is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'active' => false,
        ]);
    }

    /**
     * Indicate that the subscription is due tomorrow.
     */
    public function dueTomorrow(): static
    {
        return $this->state(fn (array $attributes) => [
            'next_run_on' => today()->addDay(),
            'active' => true,
        ]);
    }
}
