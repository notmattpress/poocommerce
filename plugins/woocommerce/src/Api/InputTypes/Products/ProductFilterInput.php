<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\InputTypes\Products;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Enums\Products\ProductStatus;
use Automattic\PooCommerce\Api\Enums\Products\StockStatus;
use Automattic\PooCommerce\Api\InputTypes\TracksProvidedFields;

/**
 * Input type for filtering products.
 *
 * Used with parameter-level #[Unroll] to expand fields as direct query arguments.
 * Uses constructor promotion so the builder can instantiate it via named arguments.
 */
#[Description( 'Filter criteria for listing products.' )]
class ProductFilterInput {
	use TracksProvidedFields;

	/**
	 * Constructor.
	 *
	 * @param ?ProductStatus $status       Filter by product status.
	 * @param ?StockStatus   $stock_status Filter by stock status.
	 * @param ?string        $search       Search products by keyword.
	 */
	public function __construct(
		#[Description( 'Filter by product status.' )]
		public readonly ?ProductStatus $status = null,
		#[Description( 'Filter by stock status.' )]
		public readonly ?StockStatus $stock_status = null,
		#[Description( 'Search products by keyword.' )]
		public readonly ?string $search = null,
	) {
	}
}
