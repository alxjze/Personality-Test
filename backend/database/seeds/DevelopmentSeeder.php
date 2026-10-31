<?php

declare(strict_types=1);

use App\App;
use App\Domain\ReflectionQuestions;
use App\Repositories\ProfileRepository;
use App\Repositories\ReflectionRepository;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Services\CareerReflectionService;
use App\Services\ConsentService;

/**
 * Creates a demo account with a profile and one rule-based reflection report.
 * No AI output is seeded — AI results must come from a real (or clearly simulated) call.
 */
return static function (App $app): void {
    $email = 'demo@psikologia.id';
    $users = $app->make(UserRepository::class);
    $existing = $users->findAuthByEmail($email);
    if ($existing) {
        echo "Demo user already exists ({$email}).\n";
        return;
    }
    $id = $users->create('Pengguna Demo', $email, AuthService::hash('Demo12345'));
    $app->make(ConsentService::class)->record($id, ConsentService::PRIVACY_POLICY);
    $app->make(ProfileRepository::class)->upsert($id, 'S1 Psikologi', 'Mahasiswa tingkat akhir', 'Berkarier di bidang HR atau people analytics', []);

    // A plausible answer set (development only).
    $answers = [];
    foreach (ReflectionQuestions::index() as $qid => $q) {
        if ($q['type'] === 'likert') {
            $answers[$qid] = match (true) {
                str_contains($qid, 'social'), str_contains($qid, 'investigative'), $qid === 'sk_empathy', $qid === 'sk_analytical', $qid === 'val_impact', $qid === 'val_growth' => 5,
                str_contains($qid, 'realistic'), $qid === 'env_fastpace' => 2,
                default => 3,
            };
        }
    }
    $answers['goal_focus'] = 'first_job';
    $answers['goal_text'] = 'Tertarik ke HR atau people analytics.';
    $svc = $app->make(CareerReflectionService::class);
    $clean = $svc->validateAnswers($answers);
    $app->make(ReflectionRepository::class)->create($id, $clean, $svc->buildReport($clean));

    echo "Seeded demo user: {$email} / Demo12345\n";
};
