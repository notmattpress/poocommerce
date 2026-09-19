<?php
/**
 * Simple Product Form
 *
 * Title: Simple
 * Slug: simple
 * Description: A single physical or virtual product, e.g. a t-shirt or an eBook
 * Product Types: simple, variable
 *
 * @package PooCommerce\Templates
 * @version 9.1.0-beta.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>
<!-- wp:poocommerce/product-section {"title":"<?php esc_attr_e( 'Basic details', 'poocommerce' ); ?>"} -->
<div data-block-name="poocommerce/product-section" class="wp-block-poocommerce-product-section" data-title="<?php esc_attr_e( 'Basic details', 'poocommerce' ); ?>">
	<div>
		<!-- wp:poocommerce/product-regular-price-field -->
		<div data-block-name="poocommerce/product-regular-price-field" class="wp-block-poocommerce-product-regular-price-field"></div>
		<!-- /wp:poocommerce/product-regular-price-field -->

		<!-- wp:poocommerce/product-checkbox-field {"label":"<?php esc_attr_e( 'Translatable Label', 'poocommerce' ); ?>","property":"testproperty"} -->
		<div data-block-name="poocommerce/product-checkbox-field" class="wp-block-poocommerce-product-checkbox-field" data-label="<?php esc_attr_e( 'Translatable Label', 'poocommerce' ); ?>"></div>
		<!-- /wp:poocommerce/product-checkbox-field -->
	</div>
</div>
<!-- /wp:poocommerce/product-section -->
