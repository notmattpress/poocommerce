<?php
/**
 * Shopify Mapper
 *
 * @package Automattic\PooCommerce\Internal\CLI\Migrator\Platforms\Shopify
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\CLI\Migrator\Platforms\Shopify;

use Automattic\PooCommerce\Internal\CLI\Migrator\Interfaces\PlatformMapperInterface;

defined( 'ABSPATH' ) || exit;

/**
 * ShopifyMapper class.
 *
 * This class is responsible for transforming raw Shopify product data
 * into a standardized format suitable for the PooCommerce Importer.
 * Currently contains stub implementations that will be replaced with actual
 * data mapping logic in future PRs.
 */
class ShopifyMapper implements PlatformMapperInterface {

	/**
	 * Maps raw Shopify product data to a standardized array format.
	 *
	 * @param object $platform_data The raw product data object from Shopify (e.g., Shopify product node).
	 *
	 * @return array A standardized array representing the product, understandable by the PooCommerce_Product_Importer.
	 */
	public function map_product_data( object $platform_data ): array {
		// Stub implementation - will be replaced with actual Shopify to PooCommerce data mapping.
		return array();
	}
}
