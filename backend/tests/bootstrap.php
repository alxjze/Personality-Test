<?php

declare(strict_types=1);

/*
 * Test bootstrap: resets the TEST database, then starts PHP's built-in server
 * with test configuration (mock AI, low AI rate limit) for HTTP-level API tests.
 *
 * Configure via env (defaults match the local dev setup in README):
 *   TEST_DB_HOST, TEST_DB_PORT, TEST_DB_DATABASE, TEST_DB_USERNAME, TEST_DB_PASSWORD, TEST_PORT
 */
require dirname(__DIR__) . '/vendor/autoload.php';

$testEnv = [
    'APP_ENV' => 'testing',
    'APP_DEBUG' => 'true',
    'APP_URL' => 'http://127.0.0.1',
    'DB_HOST' => getenv('TEST_DB_HOST') ?: '127.0.0.1',
    'DB_PORT' => getenv('TEST_DB_PORT') ?: '3306',
    'DB_DATABASE' => getenv('TEST_DB_DATABASE') ?: 'psikologia_test',
    'DB_USERNAME' => getenv('TEST_DB_USERNAME') ?: 'psikologia',
    'DB_PASSWORD' => getenv('TEST_DB_PASSWORD') ?: 'devpass',
    'SESSION_SECURE_COOKIE' => 'false',
    'AI_PROVIDER' => 'mock',
    'AI_API_KEY' => '',
    'MAIL_DRIVER' => 'log',
    'STORAGE_PATH' => sys_get_temp_dir() . '/psikologia-test-storage',
    'RL_REGISTER_MAX' => '1000',
    'RL_LOGIN_MAX' => '1000',
    'RL_FORGOT_MAX' => '1000',
    'RL_REFLECTION_MAX' => '1000',
    'RL_CV_MAX' => '1000',
    'RL_INTERVIEW_MAX' => '1000',
    'RL_ASSISTANT_MAX' => '3',
];
foreach ($testEnv as $k => $v) {
    putenv("{$k}={$v}");
}

// Fresh schema.
$app = new App\App(dirname(__DIR__));
if ($app->config->get('db.name') === 'psikologia' || $app->config->isProduction()) {
    fwrite(STDERR, "Refusing to run tests against a non-test database.\n");
    exit(1);
}
$migrator = new App\Core\Migrator($app->db, dirname(__DIR__) . '/database/migrations');
$migrator->reset();
$migrator->migrate();

// Start API server.
$port = (int) (getenv('TEST_PORT') ?: 8099);
$cmd = sprintf(
    'exec php -S 127.0.0.1:%d -t %s %s',
    $port,
    escapeshellarg(dirname(__DIR__) . '/public'),
    escapeshellarg(dirname(__DIR__) . '/public/router.php'),
);
$proc = proc_open($cmd, [0 => ['pipe', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null, array_merge(getenv(), $testEnv));
register_shutdown_function(static function () use ($proc) {
    proc_terminate($proc);
});
for ($i = 0; $i < 50; $i++) {
    if (@fsockopen('127.0.0.1', $port)) {
        break;
    }
    usleep(100000);
}
define('TEST_BASE_URL', "http://127.0.0.1:{$port}/api");
define('TEST_STORAGE', $testEnv['STORAGE_PATH']);
