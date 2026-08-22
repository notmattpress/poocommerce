<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Interfaces;

use Automattic\PooCommerce\Api\Attributes\Description;

/**
 * Interface trait that gives a type a human-readable label.
 */
#[Description( 'An object with a human-readable label' )]
trait Named {
	use Identifiable;

	#[Description( 'The display label for this object' )]
	public string $label;
}
