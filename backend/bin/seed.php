<?php

declare(strict_types=1);

// Development seed: php bin/seed.php   (refused in production)
require dirname(__DIR__) . '/vendor/autoload.php';

$app = new App\App(dirname(__DIR__));
if ($app->config->isProduction()) {
    fwrite(STDERR, "Refusing to seed in production.\n");
    exit(1);
}
(require dirname(__DIR__) . '/database/seeds/DevelopmentSeeder.php')($app);
