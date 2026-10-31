<?php

declare(strict_types=1);

namespace App\Core;

final class Router
{
    /** @var list<array{method:string, regex:string, names:list<string>, handler:callable, middleware:list<string>}> */
    private array $routes = [];

    /** @param list<string> $middleware */
    public function add(string $method, string $pattern, callable $handler, array $middleware = []): void
    {
        $names = [];
        $regex = preg_replace_callback('#\{([a-zA-Z_]+)\}#', function ($m) use (&$names) {
            $names[] = $m[1];
            return '([^/]+)';
        }, $pattern);
        $this->routes[] = [
            'method' => strtoupper($method),
            'regex' => '#^' . $regex . '$#',
            'names' => $names,
            'handler' => $handler,
            'middleware' => $middleware,
        ];
    }

    /**
     * @return array{handler:callable, middleware:list<string>, params:array<string,string>}
     */
    public function match(string $method, string $path): array
    {
        $allowed = [];
        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $path, $m)) {
                continue;
            }
            if ($route['method'] !== $method) {
                $allowed[] = $route['method'];
                continue;
            }
            array_shift($m);
            $params = [];
            foreach ($route['names'] as $i => $name) {
                $params[$name] = $m[$i] ?? '';
            }
            return ['handler' => $route['handler'], 'middleware' => $route['middleware'], 'params' => $params];
        }
        if ($allowed !== []) {
            throw new HttpException(405, 'method_not_allowed', 'Metode tidak diizinkan untuk endpoint ini.', [], ['Allow' => implode(', ', array_unique($allowed))]);
        }
        throw new HttpException(404, 'not_found', 'Endpoint tidak ditemukan.');
    }
}
