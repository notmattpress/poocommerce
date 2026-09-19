<?php
/**
 * The Template for displaying product archives, including the main shop page which is a post type archive
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/archive-product.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 8.6.0
 */

defined( 'ABSPATH' ) || exit;

get_header( 'shop' );

/**
 * Hook: poocommerce_before_main_content.
 *
 * @hooked poocommerce_output_content_wrapper - 10 (outputs opening divs for the content)
 * @hooked poocommerce_breadcrumb - 20
 * @hooked WC_Structured_Data::generate_website_data() - 30
 */
do_action( 'poocommerce_before_main_content' );

/**
 * Hook: poocommerce_shop_loop_header.
 *
 * @since 8.6.0
 *
 * @hooked poocommerce_product_taxonomy_archive_header - 10
 */
do_action( 'poocommerce_shop_loop_header' );

if ( poocommerce_product_loop() ) {

	/**
	 * Hook: poocommerce_before_shop_loop.
	 *
	 * @hooked poocommerce_output_all_notices - 10
	 * @hooked poocommerce_result_count - 20
	 * @hooked poocommerce_catalog_ordering - 30
	 */
	do_action( 'poocommerce_before_shop_loop' );

	poocommerce_product_loop_start();

	if ( wc_get_loop_prop( 'total' ) ) {
		while ( have_posts() ) {
			the_post();

			/**
			 * Hook: poocommerce_shop_loop.
			 */
			do_action( 'poocommerce_shop_loop' );

			wc_get_template_part( 'content', 'product' );
		}
	}

	poocommerce_product_loop_end();

	/**
	 * Hook: poocommerce_after_shop_loop.
	 *
	 * @hooked poocommerce_pagination - 10
	 */
	do_action( 'poocommerce_after_shop_loop' );
} else {
	/**
	 * Hook: poocommerce_no_products_found.
	 *
	 * @hooked wc_no_products_found - 10
	 */
	do_action( 'poocommerce_no_products_found' );
}

/**
 * Hook: poocommerce_after_main_content.
 *
 * @hooked poocommerce_output_content_wrapper_end - 10 (outputs closing divs for the content)
 */
do_action( 'poocommerce_after_main_content' );

/**
 * Hook: poocommerce_sidebar.
 *
 * @hooked poocommerce_get_sidebar - 10
 */
do_action( 'poocommerce_sidebar' );

get_footer( 'shop' );
