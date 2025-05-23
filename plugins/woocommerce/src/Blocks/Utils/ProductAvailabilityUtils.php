<?php
declare(strict_types=1);
namespace Automattic\PooCommerce\Blocks\Utils;

use Automattic\PooCommerce\Blocks\Templates\ProductStockIndicator;
use Automattic\PooCommerce\Enums\ProductType;
/**
 * Utility functions for product availability.
 */
class ProductAvailabilityUtils {

	/**
	 * Get product availability information.
	 *
	 * @param \WC_Product $product Product object.
	 * @return string[] The product availability class and text.
	 */
	public static function get_product_availability( $product ) {
		$product_availability = array(
			'availability' => '',
			'class'        => '',
		);

		if ( ! $product ) {
			return $product_availability;
		}

		// If the product is a variable product, check if it has any available variations.
		// We will show a custom availability message if it does.
		if ( $product->get_type() === ProductType::VARIABLE ) {
			if ( ! $product->has_available_variations() ) {
				$product_availability['availability'] = __( 'This product is currently out of stock and unavailable.', 'poocommerce' );
				$product_availability['class']        = 'out-of-stock';
			}
		} else {
			$product_availability = $product->get_availability();
		}

		/**
		 * Filters the product availability information.
		 *
		 * @since 9.7.0
		 * @param array $product_availability The product availability information.
		 * @param \WC_Product $product Product object.
		 */
		return apply_filters( 'poocommerce_product_availability', $product_availability, $product );
	}
}
