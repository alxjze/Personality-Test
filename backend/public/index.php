<?php

declare(strict_types=1);

/*
 * Psikologia Career API — front controller.
 *
 * Local dev:  backend/public/index.php            (app root = backend/)
 * Hostinger:  public_html/api/index.php           (app root = ../../psikologia-app, outside the web root)
 * Override with the APP_ROOT environment variable if your layout differs.
 */

$candidates = array_filter([
    getenv('APP_ROOT') ?: null,
    dirname(__DIR__),
    dirname(__DIR__, 2) . '/psikologia-app',
    dirname(__DIR__, 3) . '/psikologia-app',
]);
$root = null;
foreach ($candidates as $candidate) {
    if (is_file($candidate . '/vendor/autoload.php') && is_file($candidate . '/src/App.php')) {
        $root = $candidate;
        break;
    }
}
if ($root === null) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => ['code' => 'not_installed', 'message' => 'Backend belum terpasang dengan benar.']]);
    exit;
}

ini_set('display_errors', '0');
error_reporting(E_ALL);

require $root . '/vendor/autoload.php';

$app = new App\App($root);
$request = App\Core\Request::fromGlobals($app->config);
$app->handle($request)->send();
