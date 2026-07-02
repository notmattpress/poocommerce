<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\Interfaces;

use Automattic\PooCommerce\Api\Attributes\Description;

/**
 * Interface trait for objects that have a numeric ID.
 */
#[Description( 'An object with a numeric ID.' )]
trait ObjectWithId {
	/**
	 * The unique numeric identifier.
	 *
	 * @var int
	 */
	#[Description( 'The unique numeric identifier.' )]
	public int $id;
}
