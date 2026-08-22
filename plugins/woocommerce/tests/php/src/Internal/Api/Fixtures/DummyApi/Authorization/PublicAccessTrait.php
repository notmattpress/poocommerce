<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Authorization;

use Automattic\PooCommerce\Api\Attributes\PublicAccess;

/**
 * Trait carrying #[PublicAccess]; queries that `use` it inherit public
 * access without having to declare the attribute themselves.
 */
#[PublicAccess]
trait PublicAccessTrait {
}
