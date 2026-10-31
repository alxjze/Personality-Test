<?php
// Router for PHP's built-in server (development / tests only):
//   php -S 127.0.0.1:8080 -t public public/router.php
// Optionally serves the built SPA from FRONTEND_DIST for end-to-end tests.
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if ($path === '/api' || str_starts_with($path, '/api/')) {
    require __DIR__ . '/index.php';
    return true;
}
$dist = getenv('FRONTEND_DIST');
if ($dist && is_dir($dist)) {
    $file = realpath($dist . $path);
    if ($file && str_starts_with($file, realpath($dist)) && is_file($file)) {
        $types = ['js' => 'application/javascript', 'css' => 'text/css', 'svg' => 'image/svg+xml', 'png' => 'image/png', 'ico' => 'image/x-icon', 'webp' => 'image/webp', 'json' => 'application/json', 'txt' => 'text/plain', 'woff2' => 'font/woff2'];
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
        readfile($file);
        return true;
    }
    header('Content-Type: text/html; charset=utf-8');
    readfile($dist . '/index.html');
    return true;
}
http_response_code(404);
echo 'Not found';
return true;
