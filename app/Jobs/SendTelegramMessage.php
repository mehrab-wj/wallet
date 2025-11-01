<?php

namespace App\Jobs;

use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendTelegramMessage implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(public string $message)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        // Skip if Telegram is not configured
        if (! $botToken || ! $chatId) {
            return;
        }

        // Truncate message if too long (Telegram limit is 4096 characters)
        $message = $this->truncateMessage($this->message, 4000);

        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
                'disable_web_page_preview' => true,
            ]);

            if (! $response->successful()) {
                throw new Exception("Telegram API error: {$response->body()}");
            }
        } catch (Exception $e) {
            // Log to file instead (avoid infinite loop)
            Log::channel('single')->error('Failed to send Telegram message', [
                'error' => $e->getMessage(),
                'message' => $message,
            ]);

            throw $e;
        }
    }

    /**
     * Truncate message if it exceeds the limit.
     */
    private function truncateMessage(string $message, int $maxLength): string
    {
        if (strlen($message) <= $maxLength) {
            return $message;
        }

        return substr($message, 0, $maxLength).'... (truncated)';
    }
}
