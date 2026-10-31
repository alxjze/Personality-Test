<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Core\Config;
use App\Core\Logger;
use App\Domain\ReflectionQuestions;
use App\Services\AI\AiException;
use App\Services\AI\AiProviderFactory;
use App\Services\AI\JsonOutput;
use App\Services\AI\MockProvider;
use App\Services\AI\OpenAiProvider;
use App\Services\CareerReflectionService;
use App\Services\CVReviewService;
use PHPUnit\Framework\TestCase;

final class UnitTests extends TestCase
{
    private function reflection(): CareerReflectionService
    {
        return (new \ReflectionClass(CareerReflectionService::class))->newInstanceWithoutConstructor();
    }

    public function testSocialHeavyAnswersPointToPeopleArea(): void
    {
        $answers = [];
        foreach (ReflectionQuestions::index() as $id => $q) {
            if ($q['type'] === 'likert') {
                $answers[$id] = (str_contains($id, 'social') || in_array($id, ['sk_empathy', 'sk_communication', 'env_people_facing', 'val_impact'], true)) ? 5 : 1;
            }
        }
        $answers['goal_focus'] = 'explore';
        $svc = $this->reflection();
        $report = $svc->buildReport($svc->validateAnswers($answers));
        $this->assertSame('people_psychology', $report['career_areas'][0]['id']);
        $this->assertSame(100, $report['career_areas'][0]['score']);
        $this->assertSame('rule_based', $report['method']);
        // Deterministic.
        $again = $svc->buildReport($svc->validateAnswers($answers));
        $this->assertSame($report['career_areas'], $again['career_areas']);
    }

    public function testAllNeutralAnswersStillProduceCompleteReport(): void
    {
        $answers = [];
        foreach (ReflectionQuestions::index() as $id => $q) {
            if ($q['type'] === 'likert') {
                $answers[$id] = 1;
            }
        }
        $answers['goal_focus'] = 'explore';
        $svc = $this->reflection();
        $r = $svc->buildReport($svc->validateAnswers($answers));
        $this->assertSame([], $r['strengths']);
        $this->assertCount(3, $r['career_areas']);
        $this->assertNotEmpty($r['reflection_questions']);
        $this->assertStringContainsString('peta awal', $r['summary']);
    }

    public function testJsonOutputExtractsFromFencedText(): void
    {
        $this->assertSame(['a' => 1], JsonOutput::parse("Berikut hasilnya:\n```json\n{\"a\": 1}\n```"));
        $this->expectException(AiException::class);
        JsonOutput::parse('tidak ada json');
    }

    public function testCvNormalizeClampsScoresAndComputesOverall(): void
    {
        $svc = (new \ReflectionClass(CVReviewService::class))->newInstanceWithoutConstructor();
        $r = $svc->normalize([
            'criteria' => [['key' => 'structure', 'score' => 99], ['key' => 'relevance', 'score' => -5], ['key' => 'bogus', 'score' => 10]],
            'improvements' => [['area' => 'X', 'suggestion' => 'Y', 'priority' => 'super']],
        ]);
        $this->assertSame(20, $r['score']['criteria'][0]['score']);
        $this->assertSame(0, $r['score']['criteria'][1]['score']);
        $this->assertSame(20, $r['score']['overall']);
        $this->assertSame('sedang', $r['improvements'][0]['priority']);
    }

    public function testFactoryFallsBackToMockWithoutKey(): void
    {
        putenv('AI_PROVIDER=anthropic');
        putenv('AI_API_KEY=');
        $config = Config::fromEnv(sys_get_temp_dir());
        $provider = AiProviderFactory::create($config, new Logger(sys_get_temp_dir()));
        $this->assertInstanceOf(MockProvider::class, $provider);
        $this->assertTrue($provider->isSimulated());
        putenv('AI_PROVIDER=mock');
    }

    public function testProviderNetworkErrorBecomesSafeAiException(): void
    {
        $p = new OpenAiProvider('sk-test-secret', 'model-x', 3, 100, 'http://127.0.0.1:1', new Logger(sys_get_temp_dir()));
        try {
            $p->complete('system', [['role' => 'user', 'content' => 'hi']]);
            $this->fail('Expected AiException');
        } catch (AiException $e) {
            $this->assertSame(502, $e->status);
            $this->assertStringNotContainsString('sk-test-secret', $e->getMessage());
            $this->assertStringNotContainsString('127.0.0.1', $e->getMessage());
        }
    }

    public function testApiKeyNeverAppearsInFrontendBuild(): void
    {
        $dist = dirname(__DIR__, 3) . '/frontend/dist';
        if (!is_dir($dist)) {
            $this->markTestSkipped('frontend/dist not built');
        }
        $it = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dist, \FilesystemIterator::SKIP_DOTS));
        foreach ($it as $file) {
            $content = (string) file_get_contents($file->getPathname());
            $this->assertDoesNotMatchRegularExpression('/AI_API_KEY|sk-ant-|sk-proj-|AIza[0-9A-Za-z_-]{20,}|gsk_[0-9A-Za-z]{20,}|api\.anthropic\.com|api\.openai\.com|generativelanguage\.googleapis\.com|api\.groq\.com/', $content, $file->getPathname());
        }
    }
}
