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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();

            $table->string('vendor', 100);
            $table->text('description')->nullable();

            $table->decimal('input_amount', 15, 4);
            $table->char('input_currency', 3);

            $table->date('starts_on');
            $table->date('next_run_on');
            $table->date('last_run_on')->nullable();

            $table->enum('interval_unit', ['day', 'week', 'month', 'year'])->default('month');
            $table->boolean('active')->default(true);

            $table->timestamps();

            $table->index(['user_id', 'next_run_on']);
            $table->index(['active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
