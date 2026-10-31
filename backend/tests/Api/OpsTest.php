<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\ApiTestCase;
use Tests\HttpClient;

final class OpsTest extends ApiTestCase
{
    public function testMigrateEndpointIsDisabledWithoutToken(): void
    {
        // OPS_TOKEN is not set in the test environment.
        $res = (new HttpClient())->request('POST', '/ops/migrate', [], false);
        $this->assertSame(404, $res['status']);
    }
}
