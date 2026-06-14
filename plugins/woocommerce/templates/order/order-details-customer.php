<?php
/**
 * Order Customer Details
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/order/order-details-customer.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 8.7.0
 */

defined( 'ABSPATH' ) || exit;

$show_shipping = ! wc_ship_to_billing_address_only() && $order->needs_shipping_address();
?>
<section class="poocommerce-customer-details">

	<?php if ( $show_shipping ) : ?>

	<section class="poocommerce-columns poocommerce-columns--2 poocommerce-columns--addresses col2-set addresses">
		<div class="poocommerce-column poocommerce-column--1 poocommerce-column--billing-address col-1">

	<?php endif; ?>

	<h2 class="poocommerce-column__title"><?php esc_html_e( 'Billing address', 'poocommerce' ); ?></h2>

	<address>
		<?php echo wp_kses_post( $order->get_formatted_billing_address( esc_html__( 'N/A', 'poocommerce' ) ) ); ?>

		<?php if ( $order->get_billing_phone() ) : ?>
			<p class="poocommerce-customer-details--phone"><?php echo esc_html( $order->get_billing_phone() ); ?></p>
		<?php endif; ?>

		<?php if ( $order->get_billing_email() ) : ?>
			<p class="poocommerce-customer-details--email"><?php echo esc_html( $order->get_billing_email() ); ?></p>
		<?php endif; ?>

		<?php
			/**
			 * Action hook fired after an address in the order customer details.
			 *
			 * @since 8.7.0
			 * @param string $address_type Type of address (billing or shipping).
			 * @param WC_Order $order Order object.
			 */
			do_action( 'poocommerce_order_details_after_customer_address', 'billing', $order );
		?>
	</address>

	<?php if ( $show_shipping ) : ?>

		</div><!-- /.col-1 -->

		<div class="poocommerce-column poocommerce-column--2 poocommerce-column--shipping-address col-2">
			<h2 class="poocommerce-column__title"><?php esc_html_e( 'Shipping address', 'poocommerce' ); ?></h2>
			<address>
				<?php echo wp_kses_post( $order->get_formatted_shipping_address( esc_html__( 'N/A', 'poocommerce' ) ) ); ?>

				<?php if ( $order->get_shipping_phone() ) : ?>
					<p class="poocommerce-customer-details--phone"><?php echo esc_html( $order->get_shipping_phone() ); ?></p>
				<?php endif; ?>

				<?php
					/**
					 * Action hook fired after an address in the order customer details.
					 *
					 * @since 8.7.0
					 * @param string $address_type Type of address (billing or shipping).
					 * @param WC_Order $order Order object.
					 */
					do_action( 'poocommerce_order_details_after_customer_address', 'shipping', $order );
				?>
			</address>
		</div><!-- /.col-2 -->

	</section><!-- /.col2-set -->

	<?php endif; ?>

	<?php do_action( 'poocommerce_order_details_after_customer_details', $order ); ?>

</section>
