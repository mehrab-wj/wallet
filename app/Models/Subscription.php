<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'vendor',
        'description',
        'input_amount',
        'input_currency',
        'starts_on',
        'next_run_on',
        'last_run_on',
        'interval_unit',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'input_amount' => 'decimal:4',
        'starts_on' => 'date',
        'next_run_on' => 'date',
        'last_run_on' => 'date',
        'active' => 'boolean',
    ];

    /**
     * Get the user that owns the subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the account to be charged by the subscription.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the category associated with the subscription.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Check if the subscription is due for processing today.
     */
    public function isDueToday(): bool
    {
        return $this->active &&
               $this->next_run_on &&
               $this->next_run_on->isToday();
    }

    /**
     * Calculate the next run date based on the interval unit.
     */
    public function calculateNextRunDate(): \Carbon\Carbon
    {
        $currentDate = $this->next_run_on ?? $this->starts_on;

        return match ($this->interval_unit) {
            'day' => $currentDate->addDay(),
            'week' => $currentDate->addWeek(),
            'month' => $currentDate->addMonth(),
            'year' => $currentDate->addYear(),
            default => $currentDate->addMonth(), // Default to monthly
        };
    }

    /**
     * Update the subscription after processing.
     */
    public function markAsProcessed(): void
    {
        $this->update([
            'last_run_on' => now(),
            'next_run_on' => $this->calculateNextRunDate(),
        ]);
    }

    /**
     * Scope to get subscriptions that are due for processing today.
     */
    public function scopeDueToday($query)
    {
        return $query->where('active', true)
            ->whereDate('next_run_on', today());
    }
}
