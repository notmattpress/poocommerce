<?php
/**
 * The template for displaying product content within loops
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/content-product.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 9.4.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

// Check if the product is a valid PooCommerce product and ensure its visibility before proceeding.
if ( ! is_a( $product, WC_Product::class ) || ! $product->is_visible() ) {
	return;
}
?>
<li <?php wc_product_class( '', $product ); ?>>
	<?php
	/**
	 * Hook: poocommerce_before_shop_loop_item.
	 *
	 * @hooked poocommerce_template_loop_product_link_open - 10
	 */
	do_action( 'poocommerce_before_shop_loop_item' );

	/**
	 * Hook: poocommerce_before_shop_loop_item_title.
	 *
	 * @hooked poocommerce_show_product_loop_sale_flash - 10
	 * @hooked poocommerce_template_loop_product_thumbnail - 10
	 */
	do_action( 'poocommerce_before_shop_loop_item_title' );

	/**
	 * Hook: poocommerce_shop_loop_item_title.
	 *
	 * @hooked poocommerce_template_loop_product_title - 10
	 */
	do_action( 'poocommerce_shop_loop_item_title' );

	/**
	 * Hook: poocommerce_after_shop_loop_item_title.
	 *
	 * @hooked poocommerce_template_loop_rating - 5
	 * @hooked poocommerce_template_loop_price - 10
	 */
	do_action( 'poocommerce_after_shop_loop_item_title' );

	/**
	 * Hook: poocommerce_after_shop_loop_item.
	 *
	 * @hooked poocommerce_template_loop_product_link_close - 5
	 * @hooked poocommerce_template_loop_add_to_cart - 10
	 */
	do_action( 'poocommerce_after_shop_loop_item' );
	?>
</li>
