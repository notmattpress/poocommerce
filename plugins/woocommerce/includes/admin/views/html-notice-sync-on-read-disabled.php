<?php
/**
 * Admin View: Notice - HPOS sync-on-read disabled.
 *
 * @package PooCommerce\Admin\Notices
 */

defined( 'ABSPATH' ) || exit;

?>
<div id="message" class="updated poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'hpos_sync_on_read_disabled' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php esc_html_e( 'Dismiss', 'poocommerce' ); ?></a>

	<p>
		<strong><?php esc_html_e( 'HPOS order "sync on read" has been disabled', 'poocommerce' ); ?></strong><br />
		<?php
			echo wp_kses_post(
				sprintf(
					/* translators: %s: URL to blog post about this change. */
					__( 'Compatibility mode for HPOS no longer pulls order changes made to the posts database back into your orders automatically. If your site uses custom code or plugins that modify orders outside of PooCommerce, this may affect how order data is handled. <a href="%s">Learn more about this change and what to do</a>.', 'poocommerce' ),
					'https://developer.poocommerce.com/2026/02/16/hpos-sync-on-read-to-be-disabled-by-default-in-poocommerce-10-7/'
				)
			);
			?>
	</p>
</div>
