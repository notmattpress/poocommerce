<?php
/**
 * Helper Admin Notice - Woo Updater Plugin is not activated.
 *
 * @package PooCommerce\Views
 */

defined( 'ABSPATH' ) || exit;
?>
<div id="message" class="error poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'woo_updater_not_activated' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php esc_html_e( 'Dismiss', 'poocommerce' ); ?></a>
	<p>
		<?php
		echo wp_kses_post(
			sprintf(
			/* translators: 1: WP plugin management URL */
				__(
					'Please <a href="%1$s">activate the PooCommerce.com Update Manager</a> to continue receiving the updates and streamlined support included in your PooCommerce.com subscriptions.',
					'poocommerce'
				),
				esc_url( admin_url( 'plugins.php' ) ),
			)
		);
		?>
	</p>
</div>
