<?php
/**
 * The template for displaying product category thumbnails within loops
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/content-product-cat.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 4.7.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<li <?php wc_product_cat_class( '', $category ); ?>>
	<?php
	/**
	 * The poocommerce_before_subcategory hook.
	 *
	 * @hooked poocommerce_template_loop_category_link_open - 10
	 */
	do_action( 'poocommerce_before_subcategory', $category );

	/**
	 * The poocommerce_before_subcategory_title hook.
	 *
	 * @hooked poocommerce_subcategory_thumbnail - 10
	 */
	do_action( 'poocommerce_before_subcategory_title', $category );

	/**
	 * The poocommerce_shop_loop_subcategory_title hook.
	 *
	 * @hooked poocommerce_template_loop_category_title - 10
	 */
	do_action( 'poocommerce_shop_loop_subcategory_title', $category );

	/**
	 * The poocommerce_after_subcategory_title hook.
	 */
	do_action( 'poocommerce_after_subcategory_title', $category );

	/**
	 * The poocommerce_after_subcategory hook.
	 *
	 * @hooked poocommerce_template_loop_category_link_close - 10
	 */
	do_action( 'poocommerce_after_subcategory', $category );
	?>
</li>
