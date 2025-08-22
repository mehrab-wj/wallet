<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');

            $table->enum('type', ['income', 'expense']);

            $table->decimal('input_amount', 15, 4);
            $table->char('input_currency', 3);
            $table->decimal('amount', 15, 4); // this is the final amount in the account currency
            $table->decimal('rate', 10, 6)->nullable();

            $table->string('label', 100)->nullable();
            $table->text('description')->nullable();

            $table->date('transaction_date');

            $table->timestamps();

            $table->index(['user_id', 'transaction_date']);
            $table->index(['account_id', 'transaction_date']);
            $table->index(['category_id']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
