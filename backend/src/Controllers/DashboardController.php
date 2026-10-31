<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\ConversationRepository;
use App\Repositories\CvReviewRepository;
use App\Repositories\InterviewRepository;
use App\Repositories\ProfileRepository;
use App\Repositories\ReflectionRepository;

final class DashboardController extends Controller
{
    public function show(Request $r): Response
    {
        $uid = $r->userId();
        $reflections = $this->app->make(ReflectionRepository::class);
        $cv = $this->app->make(CvReviewRepository::class);
        $interviews = $this->app->make(InterviewRepository::class);
        $convs = $this->app->make(ConversationRepository::class);
        $profile = $this->app->make(ProfileRepository::class)->findByUser($uid);

        $latest = $reflections->latestForUser($uid);
        $counts = [
            'reflections' => $reflections->countForUser($uid),
            'cv_reviews' => $cv->countForUser($uid),
            'interviews' => $interviews->countForUser($uid),
            'conversations' => $convs->countForUser($uid),
        ];
        $recentInterviews = $interviews->listForUser($uid, 5);
        $answered = array_sum(array_column($recentInterviews, 'answered_count'));

        // Career development progress: 5 milestones.
        $milestones = [
            ['key' => 'profile', 'label' => 'Lengkapi profil', 'done' => !empty($profile['education']) || !empty($profile['career_goal']), 'href' => '/profile'],
            ['key' => 'reflection', 'label' => 'Selesaikan refleksi karier', 'done' => $counts['reflections'] > 0, 'href' => '/career-reflection'],
            ['key' => 'assistant', 'label' => 'Diskusi dengan AI Career Assistant', 'done' => $counts['conversations'] > 0, 'href' => '/career-assistant'],
            ['key' => 'cv', 'label' => 'Review CV', 'done' => $counts['cv_reviews'] > 0, 'href' => '/cv-reviewer'],
            ['key' => 'interview', 'label' => 'Latihan menjawab pertanyaan interview', 'done' => $answered > 0, 'href' => '/interview-preparation'],
        ];
        $done = count(array_filter($milestones, fn ($m) => $m['done']));

        $next = [];
        foreach ($milestones as $m) {
            if (!$m['done']) {
                $next[] = ['title' => $m['label'], 'href' => $m['href']];
            }
        }
        if ($latest && isset($latest['result']['next_steps'])) {
            foreach (array_slice($latest['result']['next_steps'], 0, 2) as $s) {
                $next[] = ['title' => $s['title'], 'href' => $s['action']['href'] ?? null];
            }
        }

        return Response::ok([
            'counts' => $counts,
            'progress' => ['done' => $done, 'total' => count($milestones), 'percent' => (int) round($done / count($milestones) * 100), 'milestones' => $milestones],
            'latest_reflection' => $latest ? [
                'id' => $latest['id'],
                'created_at' => $latest['created_at'],
                'summary' => $latest['result']['summary'] ?? '',
                'tags' => $latest['result']['tags'] ?? [],
                'career_areas' => array_map(fn ($a) => ['name' => $a['name'], 'score' => $a['score']], $latest['result']['career_areas'] ?? []),
            ] : null,
            'recent_cv_reviews' => $cv->listForUser($uid, 3),
            'recent_interviews' => array_slice($recentInterviews, 0, 3),
            'recent_conversations' => array_slice($convs->listForUser($uid), 0, 3),
            'next_steps' => array_slice($next, 0, 4),
        ]);
    }
}
