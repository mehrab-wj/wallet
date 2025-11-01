<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetAllocation extends Model
{
    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_id',
        'period',
        'amount',
    ];

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($allocation) {
            if (! $allocation->created_at) {
                $allocation->created_at = now();
            }
        });
    }

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'period' => 'date',
        'amount' => 'decimal:4',
        'created_at' => 'datetime',
    ];

    /**
     * Get the budget that owns the allocation.
     */
    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }
}
