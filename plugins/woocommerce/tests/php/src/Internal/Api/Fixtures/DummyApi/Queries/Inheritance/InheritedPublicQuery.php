<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Inheritance;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Authorization\PublicAccessTrait;

/**
 * Inherits #[PublicAccess] via a trait. No direct authorization attribute.
 */
#[Name( 'inheritedPublic' )]
#[Description( 'Inherits PublicAccess via a trait' )]
class InheritedPublicQuery {
	use PublicAccessTrait;

	public function execute(): string {
		return 'inherited public';
	}
}
