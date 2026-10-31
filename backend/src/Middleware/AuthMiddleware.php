<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Session;
use App\Repositories\UserRepository;

/**
 * Resolves the logged-in user from the session and attaches it to the request.
 */
final class AuthMiddleware
{
    public function __construct(private readonly Session $session, private readonly UserRepository $users)
    {
    }

    public function handle(Request $request): void
    {
        $userId = $this->session->get('user_id');
        if (!is_int($userId)) {
            throw HttpException::unauthorized();
        }
        $user = $this->users->findById($userId);
        if ($user === null) {
            $this->session->destroy();
            throw HttpException::unauthorized();
        }
        $request->attributes['user'] = $user;
    }
}
