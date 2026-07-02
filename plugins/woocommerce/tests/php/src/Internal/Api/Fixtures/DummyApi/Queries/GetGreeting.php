<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Api\Attributes\PublicAccess;

/**
 * Returns a greeting — exercises:
 * - scalar (string) return type, which the generator wraps in a result object.
 * - #[PublicAccess].
 */
#[Name( 'greeting' )]
#[Description( 'Build a greeting' )]
#[PublicAccess]
class GetGreeting {
	public function execute(
		#[Description( 'Who to greet (defaults to "world")' )]
		?string $name = null,
	): string {
		return sprintf( 'Hello, %s!', $name ?? 'world' );
	}
}
