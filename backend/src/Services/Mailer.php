<?php

declare(strict_types=1);

namespace App\Services;

use App\App;

/**
 * Mail delivery. Drivers:
 *  - log:  writes the message to the application log (development).
 *  - mail: PHP mail() — works on Hostinger once an email account for the domain exists.
 */
final class Mailer
{
    public function __construct(private readonly App $app)
    {
    }

    public function send(string $to, string $subject, string $body): bool
    {
        $driver = (string) $this->app->config->get('mail.driver', 'log');
        if ($driver === 'mail') {
            $from = (string) $this->app->config->get('mail.from');
            $name = (string) $this->app->config->get('mail.from_name');
            $headers = [
                'From' => sprintf('%s <%s>', mb_encode_mimeheader($name), $from),
                'Reply-To' => $from,
                'MIME-Version' => '1.0',
                'Content-Type' => 'text/plain; charset=UTF-8',
            ];
            $ok = @mail($to, mb_encode_mimeheader($subject), $body, $headers);
            if (!$ok) {
                $this->app->logger->error('mail() failed', ['subject' => $subject]);
            }
            return $ok;
        }
        // Development: log only (the reset link appears in storage/logs).
        $this->app->logger->info('MAIL (log driver)', ['to' => $to, 'subject' => $subject, 'body' => $body]);
        return true;
    }
}
