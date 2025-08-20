<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ExchangeRate
{
    private string $apiKey;
    private string $baseUrl = 'https://v6.exchangerate-api.com/v6';
    private int $cacheHours = 3;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? config('services.exchange_rate.api_key');
        
        if (!$this->apiKey) {
            throw new Exception('Exchange Rate API key is required');
        }
    }

    /**
     * Get exchange rate between two currencies
     *
     * @param string $baseCurrency Base currency code (e.g., 'USD', 'EUR')
     * @param string $targetCurrency Target currency code (e.g., 'GBP', 'JPY')
     * @return array
     * @throws Exception
     */
    public function getPairRate(string $baseCurrency, string $targetCurrency): array
    {
        $cacheKey = "exchange_rate.pair.{$baseCurrency}.{$targetCurrency}";
        
        return Cache::remember($cacheKey, now()->addHours($this->cacheHours), function () use ($baseCurrency, $targetCurrency) {
            $url = "{$this->baseUrl}/{$this->apiKey}/pair/{$baseCurrency}/{$targetCurrency}";
            
            $response = Http::get($url);
            
            return $this->handleResponse($response);
        });
    }

    /**
     * Convert amount between two currencies
     *
     * @param string $baseCurrency Base currency code
     * @param string $targetCurrency Target currency code
     * @param float $amount Amount to convert
     * @return array
     * @throws Exception
     */
    public function convertAmount(string $baseCurrency, string $targetCurrency, float $amount): array
    {
        // Get the pair rate (this will use cache if available)
        $pairData = $this->getPairRate($baseCurrency, $targetCurrency);
        
        // Calculate the conversion result
        $conversionResult = $pairData['conversion_rate'] * $amount;
        
        // Return the same structure as the API would return
        return array_merge($pairData, [
            'conversion_result' => $conversionResult
        ]);
    }

    /**
     * Handle API response and errors
     *
     * @param Response $response
     * @return array
     * @throws Exception
     */
    private function handleResponse(Response $response): array
    {
        if (!$response->successful()) {
            throw new Exception("API request failed with status: {$response->status()}");
        }

        $data = $response->json();

        if ($data['result'] === 'error') {
            $this->handleApiError($data['error-type']);
        }

        return $data;
    }

    /**
     * Handle specific API errors
     *
     * @param string $errorType
     * @throws Exception
     */
    private function handleApiError(string $errorType): void
    {
        $errorMessages = [
            'unsupported-code' => 'The supplied currency code is not supported',
            'malformed-request' => 'The request format is invalid',
            'invalid-key' => 'The API key is not valid',
            'inactive-account' => 'Email address was not confirmed',
            'quota-reached' => 'API request quota has been reached',
            'unknown-code' => 'Unknown currency code provided',
        ];

        $message = $errorMessages[$errorType] ?? "Unknown API error: {$errorType}";
        throw new Exception($message);
    }

    /**
     * Get only the conversion rate (simplified method)
     *
     * @param string $baseCurrency
     * @param string $targetCurrency
     * @return float
     * @throws Exception
     */
    public function getRate(string $baseCurrency, string $targetCurrency): float
    {
        $data = $this->getPairRate($baseCurrency, $targetCurrency);
        return $data['conversion_rate'];
    }

    /**
     * Get only the converted amount (simplified method)
     *
     * @param string $baseCurrency
     * @param string $targetCurrency
     * @param float $amount
     * @return float
     * @throws Exception
     */
    public function convert(string $baseCurrency, string $targetCurrency, float $amount): float
    {
        $data = $this->convertAmount($baseCurrency, $targetCurrency, $amount);
        return $data['conversion_result'];
    }

}
