<?php
/**
 * Single Product Up-Sells
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/single-product/up-sells.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see         https://poocommerce.com/document/template-structure/
 * @package     PooCommerce\Templates
 * @version     9.6.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( $upsells ) : ?>

	<section class="up-sells upsells products">
		<?php
		$heading = apply_filters( 'poocommerce_product_upsells_products_heading', __( 'You may also like&hellip;', 'poocommerce' ) );

		if ( $heading ) :
			?>
			<h2><?php echo esc_html( $heading ); ?></h2>
		<?php endif; ?>

		<?php poocommerce_product_loop_start(); ?>

			<?php foreach ( $upsells as $upsell ) : ?>

				<?php
				$post_object = get_post( $upsell->get_id() );

				setup_postdata( $GLOBALS['post'] = $post_object ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited, Squiz.PHP.DisallowMultipleAssignments.Found

				wc_get_template_part( 'content', 'product' );
				?>

			<?php endforeach; ?>

		<?php poocommerce_product_loop_end(); ?>

	</section>

	<?php
endif;

wp_reset_postdata();
