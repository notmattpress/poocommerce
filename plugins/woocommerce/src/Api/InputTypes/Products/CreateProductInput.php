<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\InputTypes\Products;

use Automattic\PooCommerce\Api\Attributes\Description;

/**
 * Input type for creating a product.
 */
#[Description( 'Data required to create a new product.' )]
class CreateProductInput extends BaseProductInput {
	#[Description( 'The product name.' )]
	public string $name;
}
