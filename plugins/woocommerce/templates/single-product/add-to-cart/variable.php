<?php
/**
 * Variable product add to cart
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/single-product/add-to-cart/variable.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 9.6.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

$attribute_keys  = array_keys( $attributes );
$variations_json = wp_json_encode( $available_variations );
$variations_attr = function_exists( 'wc_esc_json' ) ? wc_esc_json( $variations_json ) : _wp_specialchars( $variations_json, ENT_QUOTES, 'UTF-8', true );

do_action( 'poocommerce_before_add_to_cart_form' ); ?>

<form class="variations_form cart" action="<?php echo esc_url( apply_filters( 'poocommerce_add_to_cart_form_action', $product->get_permalink() ) ); ?>" method="post" enctype='multipart/form-data' data-product_id="<?php echo absint( $product->get_id() ); ?>" data-product_variations="<?php echo $variations_attr; // WPCS: XSS ok. ?>">
	<?php do_action( 'poocommerce_before_variations_form' ); ?>

	<?php if ( empty( $available_variations ) && false !== $available_variations ) : ?>
		<p class="stock out-of-stock"><?php echo esc_html( apply_filters( 'poocommerce_out_of_stock_message', __( 'This product is currently out of stock and unavailable.', 'poocommerce' ) ) ); ?></p>
	<?php else : ?>
		<table class="variations" cellspacing="0" role="presentation">
			<tbody>
				<?php foreach ( $attributes as $attribute_name => $options ) : ?>
					<tr>
						<th class="label"><label for="<?php echo esc_attr( sanitize_title( $attribute_name ) ); ?>"><?php echo wc_attribute_label( $attribute_name ); // WPCS: XSS ok. ?></label></th>
						<td class="value">
							<?php
								wc_dropdown_variation_attribute_options(
									array(
										'options'   => $options,
										'attribute' => $attribute_name,
										'product'   => $product,
									)
								);
								/**
								 * Filters the reset variation button.
								 *
								 * @since 2.5.0
								 *
								 * @param string  $button The reset variation button HTML.
								 */
								echo end( $attribute_keys ) === $attribute_name ? wp_kses_post( apply_filters( 'poocommerce_reset_variations_link', '<a class="reset_variations" href="#" aria-label="' . esc_attr__( 'Clear options', 'poocommerce' ) . '">' . esc_html__( 'Clear', 'poocommerce' ) . '</a>' ) ) : '';
							?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<div class="reset_variations_alert screen-reader-text" role="alert" aria-live="polite" aria-relevant="all"></div>
		<?php do_action( 'poocommerce_after_variations_table' ); ?>

		<div class="single_variation_wrap">
			<?php
				/**
				 * Hook: poocommerce_before_single_variation.
				 */
				do_action( 'poocommerce_before_single_variation' );

				/**
				 * Hook: poocommerce_single_variation. Used to output the cart button and placeholder for variation data.
				 *
				 * @since 2.4.0
				 * @hooked poocommerce_single_variation - 10 Empty div for variation data.
				 * @hooked poocommerce_single_variation_add_to_cart_button - 20 Qty and cart button.
				 */
				do_action( 'poocommerce_single_variation' );

				/**
				 * Hook: poocommerce_after_single_variation.
				 */
				do_action( 'poocommerce_after_single_variation' );
			?>
		</div>
	<?php endif; ?>

	<?php do_action( 'poocommerce_after_variations_form' ); ?>
</form>

<?php
do_action( 'poocommerce_after_add_to_cart_form' );
