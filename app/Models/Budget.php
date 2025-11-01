<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    /** @use HasFactory<\Database\Factories\BudgetFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'amount_type',
        'amount_value',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount_value' => 'decimal:4',
        'active' => 'boolean',
    ];

    /**
     * Get the user that owns the budget.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the categories assigned to this budget.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    /**
     * Get the allocations for this budget.
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(BudgetAllocation::class);
    }

    /**
     * Get the allocated amount for a given month.
     */
    public function getCurrentAllocation(Carbon $date): float
    {
        $period = $date->copy()->startOfMonth();

        // Try to find existing allocation for this period
        $allocation = $this->allocations()
            ->whereDate('period', $period->format('Y-m-d'))
            ->first();

        if ($allocation) {
            return (float) $allocation->amount;
        }

        // If no allocation exists, calculate it
        return $this->calculateAllocationAmount($date);
    }

    /**
     * Calculate the allocation amount based on budget type.
     */
    protected function calculateAllocationAmount(Carbon $date): float
    {
        if ($this->amount_type === 'fixed') {
            return (float) $this->amount_value;
        }

        // For percentage type, calculate from previous month's income
        $previousMonth = $date->copy()->subMonth();
        $startOfPreviousMonth = $previousMonth->copy()->startOfMonth();
        $endOfPreviousMonth = $previousMonth->copy()->endOfMonth();

        $totalIncome = Transaction::where('user_id', $this->user_id)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [
                $startOfPreviousMonth->format('Y-m-d'),
                $endOfPreviousMonth->format('Y-m-d'),
            ])
            ->sum('amount');

        return (float) ($totalIncome * ($this->amount_value / 100));
    }

    /**
     * Get the total spent amount for a given month.
     */
    public function getSpentAmount(Carbon $date): float
    {
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        $categoryIds = $this->categories()->pluck('categories.id')->toArray();

        if (empty($categoryIds)) {
            return 0.0;
        }

        return (float) Transaction::where('user_id', $this->user_id)
            ->where('type', 'expense')
            ->whereIn('category_id', $categoryIds)
            ->whereBetween('transaction_date', [
                $startOfMonth->format('Y-m-d'),
                $endOfMonth->format('Y-m-d'),
            ])
            ->sum('amount');
    }

    /**
     * Get the remaining amount for a given month.
     */
    public function getRemainingAmount(Carbon $date): float
    {
        $allocated = $this->getCurrentAllocation($date);
        $spent = $this->getSpentAmount($date);

        return $allocated - $spent;
    }

    /**
     * Create an allocation record for a given period.
     */
    public function allocateForPeriod(Carbon $period): BudgetAllocation
    {
        $periodStart = $period->copy()->startOfMonth();
        $amount = $this->calculateAllocationAmount($period);

        $allocation = $this->allocations()
            ->whereDate('period', $periodStart->format('Y-m-d'))
            ->first();

        if ($allocation) {
            $allocation->update(['amount' => $amount]);

            return $allocation;
        }

        return $this->allocations()->create([
            'period' => $periodStart->format('Y-m-d'),
            'amount' => $amount,
        ]);
    }

    /**
     * Scope a query to only include active budgets.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
