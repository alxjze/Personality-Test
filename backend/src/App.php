<?php

declare(strict_types=1);

namespace App;

use App\Core\Config;
use App\Core\Database;
use App\Core\Env;
use App\Core\HttpException;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Core\Session;
use App\Middleware\AuthMiddleware;
use App\Middleware\CsrfMiddleware;
use App\Middleware\RateLimiter;
use App\Repositories\UserRepository;
use App\Services\AI\AiProvider;
use App\Services\AI\AiProviderFactory;

/**
 * Application kernel + tiny service container.
 */
final class App
{
    public readonly Config $config;
    public readonly Database $db;
    public readonly Logger $logger;
    public readonly Session $session;

    /** @var array<string, object> */
    private array $services = [];

    public function __construct(public readonly string $root)
    {
        Env::load($root . '/.env');
        $this->config = Config::fromEnv($root);
        date_default_timezone_set('UTC');
        $logDir = Env::get('LOG_CHANNEL', 'file') === 'stderr'
            ? 'stderr'
            : rtrim((string) $this->config->get('app.storage'), '/') . '/logs';
        $this->logger = new Logger($logDir);
        $this->db = new Database($this->config);
        $this->session = new Session($this->config, $this->db);
    }

    /**
     * Lazily builds and memoizes a service.
     * @template T of object
     * @param class-string<T> $class
     * @return T
     */
    public function make(string $class): object
    {
        if (!isset($this->services[$class])) {
            $this->services[$class] = match ($class) {
                AiProvider::class => AiProviderFactory::create($this->config, $this->logger),
                RateLimiter::class => new RateLimiter($this->db, $this->config),
                default => new $class($this),
            };
        }
        /** @var T */
        return $this->services[$class];
    }

    /** Allows tests / bootstrap to swap implementations. */
    public function bind(string $class, object $instance): void
    {
        $this->services[$class] = $instance;
    }

    public function handle(Request $request): Response
    {
        try {
            $router = new Router();
            (require $this->root . '/src/routes.php')($router, $this);
            $match = $router->match($request->method, $request->path);
            $request->params = $match['params'];

            if (!in_array('no_csrf', $match['middleware'], true)) {
                (new CsrfMiddleware($this->session))->handle($request);
            }
            if (in_array('auth', $match['middleware'], true)) {
                (new AuthMiddleware($this->session, $this->make(UserRepository::class)))->handle($request);
            }
            $result = ($match['handler'])($request);
            return $result instanceof Response ? $result : Response::ok($result);
        } catch (HttpException $e) {
            return Response::error($e->status, $e->errorCode, $e->getMessage(), $e->fields, $e->headers);
        } catch (\Throwable $e) {
            $this->logger->error('Unhandled exception', [
                'type' => $e::class,
                'message' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
                'path' => $request->path,
            ]);
            $message = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
            if ($this->config->get('app.debug')) {
                $message .= ' [' . $e::class . ': ' . $e->getMessage() . ']';
            }
            return Response::error(500, 'server_error', $message);
        }
    }
}
