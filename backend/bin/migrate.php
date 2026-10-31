<?php

declare(strict_types=1);

// Usage: php bin/migrate.php            apply pending migrations
//        php bin/migrate.php --fresh    drop all tables then migrate (refused in production)
require dirname(__DIR__) . '/vendor/autoload.php';

$app = new App\App(dirname(__DIR__));
$migrator = new App\Core\Migrator($app->db, dirname(__DIR__) . '/database/migrations');

if (in_array('--fresh', $argv, true)) {
    if ($app->config->isProduction()) {
        fwrite(STDERR, "Refusing to run --fresh in production.\n");
        exit(1);
    }
    $migrator->reset();
    echo "All tables dropped.\n";
}
$applied = $migrator->migrate();
echo $applied ? 'Applied: ' . implode(', ', $applied) . "\n" : "Nothing to migrate.\n";
