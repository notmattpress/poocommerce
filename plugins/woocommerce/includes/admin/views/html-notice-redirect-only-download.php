<?php
/**
 * Admin View: Notice - Redirect only download method is selected.
 *
 * @package PooCommerce\Admin\Notices
 */

defined( 'ABSPATH' ) || exit;

?>
<div class="updated poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'redirect_download_method' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php esc_html_e( 'Dismiss', 'poocommerce' ); ?></a>
	<p>
		<?php
		echo wp_kses_post(
			sprintf(
				/* translators: %s: Link to settings page. */
				__( 'Your store is configured to serve digital products using "Redirect only" method. This method is deprecated, <a href="%s">please switch to a different method instead.</a><br><em>If you use a remote server for downloadable files (such as Google Drive, Dropbox, Amazon S3), you may optionally wish to "allow using redirects as a last resort". Enabling that and/or selecting any of the other options will make this notice go away.</em>', 'poocommerce' ),
				add_query_arg(
					array(
						'page'    => 'wc-settings',
						'tab'     => 'products',
						'section' => 'downloadable',
					),
					admin_url( 'admin.php' )
				)
			)
		);
		?>
	</p>
</div>
