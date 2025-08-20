<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static array getPairRate(string $baseCurrency, string $targetCurrency)
 * @method static array convertAmount(string $baseCurrency, string $targetCurrency, float $amount)
 * @method static float getRate(string $baseCurrency, string $targetCurrency)
 * @method static float convert(string $baseCurrency, string $targetCurrency, float $amount)
 * 
 * @see \App\Services\ExchangeRate
 */
class ExchangeRate extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'exchange-rate';
    }
}
