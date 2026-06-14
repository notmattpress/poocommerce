<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\Types\Products;

use Automattic\PooCommerce\Api\Attributes\ArrayOf;
use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Interfaces\Product;

/**
 * Output type representing a product variation.
 */
#[Description( 'A product variation.' )]
class ProductVariation {
	use Product;

	#[Description( 'The parent variable product ID.' )]
	public int $parent_id;

	#[Description( 'The selected attribute values for this variation.' )]
	#[ArrayOf( SelectedAttribute::class )]
	public array $selected_attributes;
}
