<?php
/**
 * Admin View: Notice - PooCommerce Email sender options.
 *
 * @package PooCommerce\Admin\Notices
 */

use Automattic\PooCommerce\Internal\EmailEditor\Integration;

defined( 'ABSPATH' ) || exit;

?>
<div id="message" class="updated poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'poocommerce_email_sender_options' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php esc_html_e( 'Dismiss', 'poocommerce' ); ?></a>

	<p>
	<?php
		echo wp_kses_post(
			sprintf(
			/* translators: %s: documentation URL */
				__( 'Email sender options have been moved. You can access these settings via <a href="%s">Email Template</a>.', 'poocommerce' ),
				admin_url( 'edit.php?post_type=' . Integration::EMAIL_POST_TYPE )
			)
		);
		?>
	</p>
</div>
