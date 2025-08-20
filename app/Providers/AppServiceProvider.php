<?php

namespace App\Providers;

use App\Services\ExchangeRate;
use Illuminate\Foundation\AliasLoader;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('exchange-rate', function ($app) {
            return new ExchangeRate();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register facade alias
        $loader = AliasLoader::getInstance();
        $loader->alias('ExchangeRate', \App\Facades\ExchangeRate::class);
    }
}
