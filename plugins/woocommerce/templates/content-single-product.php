<?php
/**
 * The template for displaying product content in the single-product.php template
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/content-single-product.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 3.6.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

/**
 * Hook: poocommerce_before_single_product.
 *
 * @hooked poocommerce_output_all_notices - 10
 */
do_action( 'poocommerce_before_single_product' );

if ( post_password_required() ) {
	echo get_the_password_form(); // WPCS: XSS ok.
	return;
}
?>
<div id="product-<?php the_ID(); ?>" <?php wc_product_class( '', $product ); ?>>

	<?php
	/**
	 * Hook: poocommerce_before_single_product_summary.
	 *
	 * @hooked poocommerce_show_product_sale_flash - 10
	 * @hooked poocommerce_show_product_images - 20
	 */
	do_action( 'poocommerce_before_single_product_summary' );
	?>

	<div class="summary entry-summary">
		<?php
		/**
		 * Hook: poocommerce_single_product_summary.
		 *
		 * @hooked poocommerce_template_single_title - 5
		 * @hooked poocommerce_template_single_rating - 10
		 * @hooked poocommerce_template_single_price - 10
		 * @hooked poocommerce_template_single_excerpt - 20
		 * @hooked poocommerce_template_single_add_to_cart - 30
		 * @hooked poocommerce_template_single_meta - 40
		 * @hooked poocommerce_template_single_sharing - 50
		 * @hooked WC_Structured_Data::generate_product_data() - 60
		 */
		do_action( 'poocommerce_single_product_summary' );
		?>
	</div>

	<?php
	/**
	 * Hook: poocommerce_after_single_product_summary.
	 *
	 * @hooked poocommerce_output_product_data_tabs - 10
	 * @hooked poocommerce_upsell_display - 15
	 * @hooked poocommerce_output_related_products - 20
	 */
	do_action( 'poocommerce_after_single_product_summary' );
	?>
</div>

<?php do_action( 'poocommerce_after_single_product' ); ?>
