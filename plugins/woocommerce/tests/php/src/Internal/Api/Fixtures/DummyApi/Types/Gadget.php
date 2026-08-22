<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Types;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Interfaces\Named;

/**
 * A second concrete implementation of {@see Named}, used to verify that
 * interface dispatch (`resolveType`) works across multiple implementors.
 *
 * Carries a class-level #[Name] override so the GraphQL type is `GadgetType`.
 */
#[Name( 'GadgetType' )]
#[Description( 'A dummy gadget that uses a class-level #[Name] override' )]
class Gadget {
	use Named;

	#[Description( 'How many parts the gadget contains' )]
	public int $parts_count;
}
