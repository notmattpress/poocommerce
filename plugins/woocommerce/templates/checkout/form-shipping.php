<?php
/**
 * Checkout shipping information form
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/checkout/form-shipping.php.
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
 * @global WC_Checkout $checkout
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="poocommerce-shipping-fields">
	<?php if ( true === WC()->cart->needs_shipping_address() ) : ?>

		<h3 id="ship-to-different-address">
			<label class="poocommerce-form__label poocommerce-form__label-for-checkbox checkbox">
				<input id="ship-to-different-address-checkbox" class="poocommerce-form__input poocommerce-form__input-checkbox input-checkbox" <?php checked( apply_filters( 'poocommerce_ship_to_different_address_checked', 'shipping' === get_option( 'poocommerce_ship_to_destination' ) ? 1 : 0 ), 1 ); ?> type="checkbox" name="ship_to_different_address" value="1" /> <span><?php esc_html_e( 'Ship to a different address?', 'poocommerce' ); ?></span>
			</label>
		</h3>

		<div class="shipping_address">

			<?php do_action( 'poocommerce_before_checkout_shipping_form', $checkout ); ?>

			<div class="poocommerce-shipping-fields__field-wrapper">
				<?php
				$fields = $checkout->get_checkout_fields( 'shipping' );

				foreach ( $fields as $key => $field ) {
					poocommerce_form_field( $key, $field, $checkout->get_value( $key ) );
				}
				?>
			</div>

			<?php do_action( 'poocommerce_after_checkout_shipping_form', $checkout ); ?>

		</div>

	<?php endif; ?>
</div>
<div class="poocommerce-additional-fields">
	<?php do_action( 'poocommerce_before_order_notes', $checkout ); ?>

	<?php if ( apply_filters( 'poocommerce_enable_order_notes_field', 'yes' === get_option( 'poocommerce_enable_order_comments', 'yes' ) ) ) : ?>

		<?php if ( ! WC()->cart->needs_shipping() || wc_ship_to_billing_address_only() ) : ?>

			<h3><?php esc_html_e( 'Additional information', 'poocommerce' ); ?></h3>

		<?php endif; ?>

		<div class="poocommerce-additional-fields__field-wrapper">
			<?php foreach ( $checkout->get_checkout_fields( 'order' ) as $key => $field ) : ?>
				<?php poocommerce_form_field( $key, $field, $checkout->get_value( $key ) ); ?>
			<?php endforeach; ?>
		</div>

	<?php endif; ?>

	<?php do_action( 'poocommerce_after_order_notes', $checkout ); ?>
</div>
