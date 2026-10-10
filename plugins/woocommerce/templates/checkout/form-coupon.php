<?php
/**
 * Checkout coupon form
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/checkout/form-coupon.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 9.8.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! wc_coupons_enabled() ) { // @codingStandardsIgnoreLine.
	return;
}

?>
<div class="poocommerce-form-coupon-toggle">
	<?php
		/**
		 * Filter checkout coupon message.
		 *
		 * @param string $message coupon message.
		 * @return string Filtered message.
		 *
		 * @since 1.0.0
		 */
		wc_print_notice( apply_filters( 'poocommerce_checkout_coupon_message', esc_html__( 'Have a coupon?', 'poocommerce' ) . ' <a href="#" role="button" aria-label="' . esc_attr__( 'Enter your coupon code', 'poocommerce' ) . '" aria-controls="poocommerce-checkout-form-coupon" aria-expanded="false" class="showcoupon">' . esc_html__( 'Click here to enter your code', 'poocommerce' ) . '</a>' ), 'notice' );
	?>
</div>

<form class="checkout_coupon poocommerce-form-coupon" method="post" style="display:none" id="poocommerce-checkout-form-coupon">

	<p class="form-row form-row-first">
		<label for="coupon_code" class="screen-reader-text"><?php esc_html_e( 'Coupon:', 'poocommerce' ); ?></label>
		<input type="text" name="coupon_code" class="input-text" placeholder="<?php esc_attr_e( 'Coupon code', 'poocommerce' ); ?>" id="coupon_code" value="" />
	</p>

	<p class="form-row form-row-last">
		<button type="submit" class="button<?php echo esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '' ); ?>" name="apply_coupon" value="<?php esc_attr_e( 'Apply coupon', 'poocommerce' ); ?>"><?php esc_html_e( 'Apply coupon', 'poocommerce' ); ?></button>
	</p>

	<div class="clear"></div>
</form>
