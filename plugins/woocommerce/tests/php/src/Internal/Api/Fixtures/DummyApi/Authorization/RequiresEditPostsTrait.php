<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Authorization;

use Automattic\PooCommerce\Api\Attributes\RequiredCapability;

/**
 * Trait carrying #[RequiredCapability('edit_posts')]. Combined with another
 * inheritance source (parent class) on the same query class, the builder
 * should merge the capabilities from both into the generated check list.
 */
#[RequiredCapability( 'edit_posts' )]
trait RequiresEditPostsTrait {
}
