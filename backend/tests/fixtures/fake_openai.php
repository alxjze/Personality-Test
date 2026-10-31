<?php
// Fake OpenAI-compatible endpoint for provider tests. Echoes request shape back as the reply.
$body = json_decode((string) file_get_contents('php://input'), true) ?: [];
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
header('Content-Type: application/json');
if ($auth !== 'Bearer test-key') {
    http_response_code(401);
    echo json_encode([['error' => ['code' => 401, 'status' => 'UNAUTHENTICATED']]]);
    return;
}
if (($body['messages'][1]['content'] ?? '') === 'rate') {
    http_response_code(429);
    echo json_encode(['error' => ['type' => 'rate_limit']]);
    return;
}
echo json_encode([
    'model' => $body['model'] ?? '',
    'choices' => [[
        'finish_reason' => 'stop',
        'message' => ['content' => json_encode([
            'path' => $_SERVER['REQUEST_URI'],
            'keys' => array_keys($body),
            'system' => $body['messages'][0]['role'] ?? null,
        ])],
    ]],
]);
