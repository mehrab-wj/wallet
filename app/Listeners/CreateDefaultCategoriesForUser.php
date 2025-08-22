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
            ['name' => '🍜 Food', 'type' => 'expense', 'sort_order' => 1, 'user_id' => $user->id],
            ['name' => '🛒 Groceries', 'type' => 'expense', 'sort_order' => 2, 'user_id' => $user->id],
            ['name' => '🧩 Entertainment', 'type' => 'expense', 'sort_order' => 3, 'user_id' => $user->id],
            ['name' => '🚖 Transport', 'type' => 'expense', 'sort_order' => 4, 'user_id' => $user->id],
            ['name' => '🛍️ Shopping', 'type' => 'expense', 'sort_order' => 5, 'user_id' => $user->id],
            ['name' => '💻 Work', 'type' => 'expense', 'sort_order' => 6, 'user_id' => $user->id],
            ['name' => '💪 Sports', 'type' => 'expense', 'sort_order' => 7, 'user_id' => $user->id],
            ['name' => '🧘🏼 Health', 'type' => 'expense', 'sort_order' => 8, 'user_id' => $user->id],
            ['name' => '🏡 Rent', 'type' => 'expense', 'sort_order' => 9, 'user_id' => $user->id],
            ['name' => '📚 Education', 'type' => 'expense', 'sort_order' => 10, 'user_id' => $user->id],
            ['name' => '💄 Beauty', 'type' => 'expense', 'sort_order' => 11, 'user_id' => $user->id],
            ['name' => '🎁 Gift', 'type' => 'expense', 'sort_order' => 12, 'user_id' => $user->id],
            ['name' => 'Other', 'type' => 'expense', 'sort_order' => 13, 'user_id' => $user->id],

            // Income Categories
            ['name' => '💰 Salary', 'type' => 'income', 'sort_order' => 11, 'user_id' => $user->id],
            ['name' => '💼 Freelance', 'type' => 'income', 'sort_order' => 12, 'user_id' => $user->id],
            ['name' => '📈 Investment', 'type' => 'income', 'sort_order' => 13, 'user_id' => $user->id],
            ['name' => '🤑 Business', 'type' => 'income', 'sort_order' => 14, 'user_id' => $user->id],
            ['name' => '🎁 Gift', 'type' => 'income', 'sort_order' => 15, 'user_id' => $user->id],
            ['name' => '↩️ Refund', 'type' => 'income', 'sort_order' => 16, 'user_id' => $user->id],
            ['name' => 'Other', 'type' => 'income', 'sort_order' => 17, 'user_id' => $user->id],
        ];

        Category::insert($defaultCategories);

        // Create two default accounts
        $user->accounts()->create([
            'name' => 'Bank Account',
            'currency' => 'USD',
        ]);

        $user->accounts()->create([
            'name' => 'Cash',
            'currency' => 'USD',
        ]);
    }
}
