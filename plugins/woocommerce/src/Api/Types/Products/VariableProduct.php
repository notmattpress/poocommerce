<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\Types\Products;

use Automattic\PooCommerce\Api\Attributes\ConnectionOf;
use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Parameter;
use Automattic\PooCommerce\Api\Interfaces\Product;
use Automattic\PooCommerce\Api\Pagination\Connection;
use Automattic\PooCommerce\Api\Pagination\PaginationParams;

/**
 * Output type representing a variable product with variations.
 */
#[Description( 'A variable product with variations.' )]
class VariableProduct {
	use Product;

	#[Description( 'The product variations.' )]
	#[ConnectionOf( ProductVariation::class )]
	#[Parameter( type: PaginationParams::class )]
	public Connection $variations;
}
