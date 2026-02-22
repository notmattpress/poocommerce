<?php
/**
 * Admin View: Notice - Install
 *
 * @deprecated 4.6.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>
<div id="message" class="updated poocommerce-message wc-connect">
	<p><?php _e( '<strong>Welcome to PooCommerce</strong> &#8211; You&lsquo;re almost ready to start selling :)', 'poocommerce' ); ?></p>
	<p class="submit"><a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-setup' ) ); ?>" class="button-primary"><?php _e( 'Run the Setup Wizard', 'poocommerce' ); ?></a> <a class="button-secondary skip" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'install' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php _e( 'Skip setup', 'poocommerce' ); ?></a></p>
</div>
