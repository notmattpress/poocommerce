<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\Types\Products;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Interfaces\Product;

/**
 * Output type representing a simple PooCommerce product.
 */
#[Description( 'A simple PooCommerce product.' )]
class SimpleProduct {
	use Product;
}
