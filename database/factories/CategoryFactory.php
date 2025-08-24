<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->word(),
            'type' => fake()->randomElement(['income', 'expense']),
            'parent_id' => null,
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }

    /**
     * Indicate that the category is an expense category.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
        ]);
    }

    /**
     * Indicate that the category is an income category.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
        ]);
    }
}
