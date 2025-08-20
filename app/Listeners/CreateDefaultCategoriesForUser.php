<?php

namespace App\Listeners;

use App\Models\Category;
use App\Models\User;

class CreateDefaultCategoriesForUser
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $user = $event->user;

        if (!$user instanceof User) {
            return;
        }

        $defaultCategories = [
            // Expense Categories
            ['name' => '🍽️ Food', 'type' => 'expense', 'sort_order' => 1],
            ['name' => '🚗 Transport', 'type' => 'expense', 'sort_order' => 2],
            ['name' => '🛍️ Shopping', 'type' => 'expense', 'sort_order' => 3],
            ['name' => '💡 Bills', 'type' => 'expense', 'sort_order' => 4],
            ['name' => '🎬 Entertainment', 'type' => 'expense', 'sort_order' => 5],
            ['name' => '🏥 Healthcare', 'type' => 'expense', 'sort_order' => 6],
            ['name' => '📚 Education', 'type' => 'expense', 'sort_order' => 7],
            ['name' => '✈️ Travel', 'type' => 'expense', 'sort_order' => 8],
            ['name' => '🛡️ Insurance', 'type' => 'expense', 'sort_order' => 9],
            ['name' => '💸 Other', 'type' => 'expense', 'sort_order' => 10],

            // Income Categories
            ['name' => '💰 Salary', 'type' => 'income', 'sort_order' => 11],
            ['name' => '💼 Freelance', 'type' => 'income', 'sort_order' => 12],
            ['name' => '📈 Investment', 'type' => 'income', 'sort_order' => 13],
            ['name' => '🏢 Business', 'type' => 'income', 'sort_order' => 14],
            ['name' => '🎁 Gift', 'type' => 'income', 'sort_order' => 15],
            ['name' => '↩️ Refund', 'type' => 'income', 'sort_order' => 16],
            ['name' => '💵 Other', 'type' => 'income', 'sort_order' => 17],
        ];

        foreach ($defaultCategories as $categoryData) {
            Category::create([
                'user_id' => $user->id,
                'name' => $categoryData['name'],
                'type' => $categoryData['type'],
                'sort_order' => $categoryData['sort_order'],
            ]);
        }
    }
}
