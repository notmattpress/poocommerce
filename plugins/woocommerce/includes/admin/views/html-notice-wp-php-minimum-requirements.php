<?php
/**
 * Admin View: Notice - PHP & WP minimum requirements.
 *
 * @package PooCommerce\Admin\Notices
 */

defined( 'ABSPATH' ) || exit;
?>
<div id="message" class="updated poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', WC_PHP_MIN_REQUIREMENTS_NOTICE ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>"><?php esc_html_e( 'Dismiss', 'poocommerce' ); ?></a>

	<p>
		<?php
		echo wp_kses_post(
			sprintf(
				$msg . '<p><a href="%s" class="button button-primary">' . __( 'Learn how to upgrade', 'poocommerce' ) . '</a></p>',
				add_query_arg(
					array(
						'utm_source'   => 'wpphpupdatebanner',
						'utm_medium'   => 'product',
						'utm_campaign' => 'poocommerceplugin',
						'utm_content'  => 'docs',
					),
					'https://poocommerce.com/document/update-php-wordpress/'
				)
			)
		);
		?>
	</p>
</div>
