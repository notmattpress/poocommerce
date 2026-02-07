<?php
/**
 * Admin View: Notice - Uploads directory is unprotected.
 *
 * @package PooCommerce\Admin\Notices
 * @since   4.2.0
 */

defined( 'ABSPATH' ) || exit;

$uploads = wp_get_upload_dir();

?>
<div id="message" class="error poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'uploads_directory_is_unprotected' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php esc_html_e( 'Dismiss', 'poocommerce' ); ?></a>

	<p>
	<?php
		echo wp_kses_post(
			sprintf(
				/* translators: 1: uploads directory URL 2: documentation URL */
				__( 'Your store\'s uploads directory is <a href="%1$s">browsable via the web</a>. We strongly recommend <a href="%2$s">configuring your web server to prevent directory indexing</a>.', 'poocommerce' ),
				esc_url( $uploads['baseurl'] . '/poocommerce_uploads' ),
				'https://poocommerce.com/document/digital-downloadable-product-handling/#protecting-your-uploads-directory'
			)
		);
		?>
	</p>
</div>
