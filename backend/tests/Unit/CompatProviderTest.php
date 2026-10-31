<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Core\Config;
use App\Core\Logger;
use App\Services\AI\AiException;
use App\Services\AI\AiProviderFactory;
use App\Services\AI\OpenAiProvider;
use PHPUnit\Framework\TestCase;

final class CompatProviderTest extends TestCase
{
    private static $proc;
    private const PORT = 8097;

    public static function setUpBeforeClass(): void
    {
        $script = escapeshellarg(dirname(__DIR__) . '/fixtures/fake_openai.php');
        self::$proc = proc_open('exec php -S 127.0.0.1:' . self::PORT . ' ' . $script, [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes);
        for ($i = 0; $i < 50 && !@fsockopen('127.0.0.1', self::PORT); $i++) {
            usleep(100000);
        }
    }

    public static function tearDownAfterClass(): void
    {
        proc_terminate(self::$proc);
    }

    private function provider(string $key = 'test-key', bool $compat = true): OpenAiProvider
    {
        return new OpenAiProvider($key, 'gemini-2.5-flash', 5, 500, 'http://127.0.0.1:' . self::PORT . '/v1beta/openai', new Logger(sys_get_temp_dir()), 'gemini', $compat);
    }

    public function testCompatRequestShape(): void
    {
        $res = $this->provider()->complete('sys', [['role' => 'user', 'content' => 'halo']], ['json' => true]);
        $echo = json_decode($res->text, true);
        $this->assertSame('/v1beta/openai/chat/completions', $echo['path']);
        $this->assertContains('max_tokens', $echo['keys']);
        $this->assertNotContains('max_completion_tokens', $echo['keys']);
        $this->assertNotContains('response_format', $echo['keys']);
        $this->assertSame('system', $echo['system']);
        $this->assertSame('gemini', $res->provider);
        $this->assertSame('gemini-2.5-flash', $res->model);
        $this->assertFalse($res->simulated);
    }

    public function testOpenAiRequestShape(): void
    {
        $echo = json_decode($this->provider('test-key', false)->complete('sys', [['role' => 'user', 'content' => 'x']], ['json' => true])->text, true);
        $this->assertContains('max_completion_tokens', $echo['keys']);
        $this->assertContains('response_format', $echo['keys']);
    }

    public function testErrorsAreMappedToSafeMessages(): void
    {
        try {
            $this->provider('wrong')->complete('s', [['role' => 'user', 'content' => 'x']]);
            $this->fail('expected exception');
        } catch (AiException $e) {
            $this->assertSame('ai_misconfigured', $e->errorCode);
        }
        try {
            $this->provider()->complete('s', [['role' => 'user', 'content' => 'rate']]);
            $this->fail('expected exception');
        } catch (AiException $e) {
            $this->assertSame('ai_busy', $e->errorCode);
        }
    }

    public function testFactoryBuildsFreeTierProviders(): void
    {
        foreach (['gemini', 'groq'] as $name) {
            putenv("AI_PROVIDER={$name}");
            putenv('AI_API_KEY=dummy');
            $p = AiProviderFactory::create(Config::fromEnv(sys_get_temp_dir()), new Logger(sys_get_temp_dir()));
            $this->assertInstanceOf(OpenAiProvider::class, $p);
            $this->assertSame($name, $p->name());
            $this->assertFalse($p->isSimulated());
        }
        putenv('AI_PROVIDER=mock');
        putenv('AI_API_KEY=');
    }
}
