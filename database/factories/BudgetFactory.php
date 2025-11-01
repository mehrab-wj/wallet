<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Budget>
 */
class BudgetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amountType = fake()->randomElement(['fixed', 'percentage']);

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'amount_type' => $amountType,
            'amount_value' => $amountType === 'fixed'
                ? fake()->randomFloat(2, 100, 2000)
                : fake()->numberBetween(5, 50),
            'active' => true,
        ];
    }

    /**
     * Indicate that the budget uses a fixed amount.
     */
    public function fixed(?float $amount = null): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_type' => 'fixed',
            'amount_value' => $amount ?? fake()->randomFloat(2, 100, 2000),
        ]);
    }

    /**
     * Indicate that the budget uses a percentage of income.
     */
    public function percentage(?int $percent = null): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_type' => 'percentage',
            'amount_value' => $percent ?? fake()->numberBetween(5, 50),
        ]);
    }

    /**
     * Indicate that the budget is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'active' => false,
        ]);
    }
}
