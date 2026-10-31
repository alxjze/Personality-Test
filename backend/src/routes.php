<?php

declare(strict_types=1);

use App\App;
use App\Controllers\AssistantController;
use App\Controllers\AuthController;
use App\Controllers\CvReviewController;
use App\Controllers\DashboardController;
use App\Controllers\HealthController;
use App\Controllers\InterviewController;
use App\Controllers\OpsController;
use App\Controllers\ProfileController;
use App\Controllers\ReflectionController;
use App\Core\Router;

return static function (Router $router, App $app): void {
    $c = static fn (string $class, string $method) => static fn ($req) => (new $class($app))->$method($req);
    $auth = ['auth'];

    $router->add('GET', '/health', $c(HealthController::class, 'show'));
    // Token-protected maintenance (no CSRF: not cookie-authenticated). Disabled unless OPS_TOKEN is set.
    $router->add('POST', '/ops/migrate', $c(OpsController::class, 'migrate'), ['no_csrf']);

    // Authentication
    $router->add('GET', '/auth/csrf', $c(AuthController::class, 'csrf'));
    $router->add('GET', '/auth/me', $c(AuthController::class, 'me'));
    $router->add('POST', '/auth/register', $c(AuthController::class, 'register'));
    $router->add('POST', '/auth/login', $c(AuthController::class, 'login'));
    $router->add('POST', '/auth/logout', $c(AuthController::class, 'logout'));
    $router->add('POST', '/auth/forgot-password', $c(AuthController::class, 'forgot'));
    $router->add('POST', '/auth/reset-password', $c(AuthController::class, 'reset'));

    // Career reflection (questions + preview are public so guests can try)
    $router->add('GET', '/reflections/questions', $c(ReflectionController::class, 'questions'));
    $router->add('POST', '/reflections/preview', $c(ReflectionController::class, 'preview'));
    $router->add('POST', '/reflections', $c(ReflectionController::class, 'store'), $auth);
    $router->add('GET', '/reflections', $c(ReflectionController::class, 'index'), $auth);
    $router->add('GET', '/reflections/latest', $c(ReflectionController::class, 'latest'), $auth);
    $router->add('GET', '/reflections/{id}', $c(ReflectionController::class, 'show'), $auth);
    $router->add('DELETE', '/reflections/{id}', $c(ReflectionController::class, 'destroy'), $auth);

    // AI Career Assistant
    $router->add('POST', '/assistant/chat', $c(AssistantController::class, 'chat'), $auth);
    $router->add('GET', '/assistant/conversations', $c(AssistantController::class, 'conversations'), $auth);
    $router->add('GET', '/assistant/conversations/{id}', $c(AssistantController::class, 'show'), $auth);
    $router->add('DELETE', '/assistant/conversations/{id}', $c(AssistantController::class, 'destroy'), $auth);

    // CV Reviewer
    $router->add('POST', '/cv-reviews', $c(CvReviewController::class, 'store'), $auth);
    $router->add('GET', '/cv-reviews', $c(CvReviewController::class, 'index'), $auth);
    $router->add('GET', '/cv-reviews/{id}', $c(CvReviewController::class, 'show'), $auth);
    $router->add('DELETE', '/cv-reviews/{id}', $c(CvReviewController::class, 'destroy'), $auth);

    // Interview Preparation
    $router->add('GET', '/interviews/types', $c(InterviewController::class, 'types'));
    $router->add('POST', '/interviews', $c(InterviewController::class, 'store'), $auth);
    $router->add('GET', '/interviews', $c(InterviewController::class, 'index'), $auth);
    $router->add('GET', '/interviews/{id}', $c(InterviewController::class, 'show'), $auth);
    $router->add('POST', '/interviews/{id}/answer', $c(InterviewController::class, 'answer'), $auth);
    $router->add('DELETE', '/interviews/{id}', $c(InterviewController::class, 'destroy'), $auth);

    // Profile & privacy
    $router->add('GET', '/profile', $c(ProfileController::class, 'show'), $auth);
    $router->add('PUT', '/profile', $c(ProfileController::class, 'update'), $auth);
    $router->add('DELETE', '/profile', $c(ProfileController::class, 'destroy'), $auth);
    $router->add('PUT', '/profile/password', $c(ProfileController::class, 'password'), $auth);
    $router->add('GET', '/profile/consents', $c(ProfileController::class, 'consents'), $auth);
    $router->add('PUT', '/profile/consents', $c(ProfileController::class, 'updateConsent'), $auth);
    $router->add('DELETE', '/profile/data', $c(ProfileController::class, 'deleteData'), $auth);

    // Dashboard
    $router->add('GET', '/dashboard', $c(DashboardController::class, 'show'), $auth);
};
