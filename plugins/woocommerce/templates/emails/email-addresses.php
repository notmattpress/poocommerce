<?php
/**
 * Email Addresses
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/emails/email-addresses.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates\Emails
 * @version 9.7.0
 */

use Automattic\PooCommerce\Utilities\FeaturesUtil;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$address  = $order->get_formatted_billing_address();
$shipping = $order->get_formatted_shipping_address();

$email_improvements_enabled = FeaturesUtil::feature_is_enabled( 'email_improvements' );

?><table id="addresses" cellspacing="0" cellpadding="0" style="width: 100%; vertical-align: top; margin-bottom: 40px; padding:0;" border="0">
	<tr>
		<td class="font-family text-align-left" style="border:0; padding:0;" valign="top" width="50%">
			<?php if ( $email_improvements_enabled ) { ?>
				<b><?php esc_html_e( 'Billing address', 'poocommerce' ); ?></b>
			<?php } else { ?>
				<h2><?php esc_html_e( 'Billing address', 'poocommerce' ); ?></h2>
			<?php } ?>

			<address class="address">
				<?php echo wp_kses_post( $address ? $address : esc_html__( 'N/A', 'poocommerce' ) ); ?>
				<?php if ( $order->get_billing_phone() ) : ?>
					<br/><?php echo wc_make_phone_clickable( $order->get_billing_phone() ); ?>
				<?php endif; ?>
				<?php if ( $order->get_billing_email() ) : ?>
					<br/><?php echo esc_html( $order->get_billing_email() ); ?>
				<?php endif; ?>
				<?php
				/**
				 * Fires after the core address fields in emails.
				 *
				 * @since 8.6.0
				 *
				 * @param string $type Address type. Either 'billing' or 'shipping'.
				 * @param WC_Order $order Order instance.
				 * @param bool $sent_to_admin If this email is being sent to the admin or not.
				 * @param bool $plain_text If this email is plain text or not.
				 */
				do_action( 'poocommerce_email_customer_address_section', 'billing', $order, $sent_to_admin, false );
				?>
			</address>
		</td>
		<?php if ( ! wc_ship_to_billing_address_only() && $order->needs_shipping_address() && $shipping ) : ?>
			<td class="font-family text-align-left" style="padding:0;" valign="top" width="50%">
				<?php if ( $email_improvements_enabled ) { ?>
					<b><?php esc_html_e( 'Shipping address', 'poocommerce' ); ?></b>
				<?php } else { ?>
					<h2><?php esc_html_e( 'Shipping address', 'poocommerce' ); ?></h2>
				<?php } ?>

				<address class="address">
					<?php echo wp_kses_post( $shipping ); ?>
					<?php if ( $order->get_shipping_phone() ) : ?>
						<br /><?php echo wc_make_phone_clickable( $order->get_shipping_phone() ); ?>
					<?php endif; ?>
					<?php
					/**
					 * Fires after the core address fields in emails.
					 *
					 * @since 8.6.0
					 *
					 * @param string $type Address type. Either 'billing' or 'shipping'.
					 * @param WC_Order $order Order instance.
					 * @param bool $sent_to_admin If this email is being sent to the admin or not.
					 * @param bool $plain_text If this email is plain text or not.
					 */
					do_action( 'poocommerce_email_customer_address_section', 'shipping', $order, $sent_to_admin, false );
					?>
				</address>
			</td>
		<?php endif; ?>
	</tr>
</table>
