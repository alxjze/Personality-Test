<?php

declare(strict_types=1);

/*
 * Vercel entry point (vercel-php runtime). The same PHP backend as Hostinger.
 * Composer dependencies are installed from the repository-root composer.json by the runtime.
 * Stateless platform settings: SESSION_DRIVER=database, CV_STORE_FILES=false, LOG_CHANNEL=stderr.
 */
ini_set('display_errors', '0');
error_reporting(E_ALL);

$root = dirname(__DIR__);
require $root . '/vendor/autoload.php';

if (!getenv('STORAGE_PATH')) {
    putenv('STORAGE_PATH=/tmp/psikologia');
}
if (!getenv('LOG_CHANNEL')) {
    putenv('LOG_CHANNEL=stderr');
}

$app = new App\App($root . '/backend');
$request = App\Core\Request::fromGlobals($app->config);
$app->handle($request)->send();
