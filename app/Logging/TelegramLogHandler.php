<?php

namespace App\Logging;

use App\Jobs\SendTelegramMessage;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Level;
use Monolog\LogRecord;

class TelegramLogHandler extends AbstractProcessingHandler
{
    /**
     * Create a new Telegram log handler instance.
     */
    public function __construct(Level $level = Level::Debug, bool $bubble = true)
    {
        parent::__construct($level, $bubble);
    }

    /**
     * Write the log record to Telegram.
     */
    protected function write(LogRecord $record): void
    {
        // Format the message
        $message = $this->formatMessage($record);

        // Dispatch the message to Telegram via queue
        SendTelegramMessage::dispatch($message);
    }

    /**
     * Format the log message for Telegram.
     */
    private function formatMessage(LogRecord $record): string
    {
        $emoji = $this->getEmojiForLevel($record->level);
        $env = config('app.env');
        $appName = config('app.name');

        $message = "{$emoji} *{$appName}* [{$env}]\n\n";
        $message .= "*Level:* {$record->level->getName()}\n";
        $message .= "*Message:* {$record->message}\n";

        // Add context if present
        if (! empty($record->context)) {
            $message .= "\n*Context:*\n";
            $message .= "```\n";
            $message .= json_encode($record->context, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            $message .= "\n```";
        }

        $message .= "\n\n*Time:* ".now()->toDateTimeString();

        return $message;
    }

    /**
     * Get the appropriate emoji for the log level.
     */
    private function getEmojiForLevel(Level $level): string
    {
        return match ($level->getName()) {
            'DEBUG' => '🔍',
            'INFO' => 'ℹ️',
            'NOTICE' => '📌',
            'WARNING' => '⚠️',
            'ERROR' => '❌',
            'CRITICAL' => '🔥',
            'ALERT' => '🚨',
            'EMERGENCY' => '💀',
            default => '📝',
        };
    }
}
