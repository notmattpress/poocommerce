<?php
/**
 * Admin View: Notice - Updated.
 *
 * @package PooCommerce\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>
<div id="message" class="updated poocommerce-message wc-connect poocommerce-message--success">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'update', remove_query_arg( 'do_update_poocommerce' ) ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php esc_html_e( 'Dismiss', 'poocommerce' ); ?></a>

	<p><?php esc_html_e( 'PooCommerce database update complete. Thank you for updating to the latest version!', 'poocommerce' ); ?></p>
</div>
