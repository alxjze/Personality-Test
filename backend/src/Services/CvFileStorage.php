<?php

declare(strict_types=1);

namespace App\Services;

use App\App;

/**
 * Private CV storage outside the public web root: {storage}/cv/{userId}/{random}.pdf
 * Paths stored in the DB are relative to the storage directory.
 */
final class CvFileStorage
{
    private string $base;

    public function __construct(private readonly App $app)
    {
        $this->base = rtrim((string) $app->config->get('app.storage'), '/') . '/cv';
    }

    public function enabled(): bool
    {
        return (bool) $this->app->config->get('upload.store_files', true);
    }

    public function store(int $userId, string $tmpPath): ?string
    {
        if (!$this->enabled()) {
            return null;
        }
        $dir = $this->base . '/' . $userId;
        if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
            $this->app->logger->error('Cannot create CV directory');
            return null;
        }
        $name = bin2hex(random_bytes(16)) . '.pdf';
        $dest = $dir . '/' . $name;
        $moved = is_uploaded_file($tmpPath) ? @move_uploaded_file($tmpPath, $dest) : @copy($tmpPath, $dest);
        if (!$moved) {
            $this->app->logger->error('Cannot store CV file');
            return null;
        }
        @chmod($dest, 0600);
        return 'cv/' . $userId . '/' . $name;
    }

    public function delete(?string $relative): void
    {
        if ($relative === null || !preg_match('#^cv/\d+/[a-f0-9]{32}\.pdf$#', $relative)) {
            return;
        }
        $full = rtrim((string) $this->app->config->get('app.storage'), '/') . '/' . $relative;
        if (is_file($full)) {
            @unlink($full);
        }
    }

    public function deleteAllForUser(int $userId): void
    {
        $dir = $this->base . '/' . $userId;
        if (!is_dir($dir)) {
            return;
        }
        foreach (glob($dir . '/*.pdf') ?: [] as $f) {
            @unlink($f);
        }
        @rmdir($dir);
    }
}
