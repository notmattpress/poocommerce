<?php
/**
 * Admin View: Notice - No Shipping methods.
 *
 * @package PooCommerce\Admin\Notices
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div id="message" class="updated poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'no_shipping_methods' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>">
		<?php esc_html_e( 'Dismiss', 'poocommerce' ); ?>
	</a>

	<p class="main">
		<strong>
			<?php esc_html_e( 'Add shipping methods &amp; zones', 'poocommerce' ); ?>
		</strong>
	</p>
	<p>
		<?php esc_html_e( 'Shipping is currently enabled, but you have not added any shipping methods to your shipping zones.', 'poocommerce' ); ?>
	</p>
	<p>
		<?php esc_html_e( 'Customers will not be able to purchase physical goods from your store until a shipping method is available.', 'poocommerce' ); ?>
	</p>

	<p class="submit">
		<a class="button-primary" href="<?php echo esc_url( admin_url( 'admin.php?page=wc-settings&tab=shipping' ) ); ?>">
			<?php esc_html_e( 'Setup shipping zones', 'poocommerce' ); ?>
		</a>
		<a class="button-secondary" href="https://poocommerce.com/document/setting-up-shipping-zones/">
			<?php esc_html_e( 'Learn more about shipping zones', 'poocommerce' ); ?>
		</a>
	</p>
</div>
