<?php
/**
 * Admin View: Notice - Base table missing.
 *
 * @package PooCommerce\Admin
 */

defined( 'ABSPATH' ) || exit;

?>
<div class="updated poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'base_tables_missing' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>">
		<?php esc_html_e( 'Dismiss', 'poocommerce' ); ?>
	</a>

	<p>
		<strong><?php esc_html_e( 'Database tables missing', 'poocommerce' ); ?></strong>
	</p>
	<p>
		<?php
		$verify_db_tool_available = array_key_exists( 'verify_db_tables', WC_Admin_Status::get_tools() );
		$missing_tables           = get_option( 'poocommerce_schema_missing_tables' );
		if ( $verify_db_tool_available ) {
			echo wp_kses_post(
				sprintf(
				/* translators: %1%s: Missing tables (separated by ",") %2$s: Link to check again */
					__( 'One or more tables required for PooCommerce to function are missing, some features may not work as expected. Missing tables: %1$s. <a href="%2$s">Check again.</a>', 'poocommerce' ),
					esc_html( implode( ', ', $missing_tables ) ),
					wp_nonce_url( admin_url( 'admin.php?page=wc-status&tab=tools&action=verify_db_tables' ), 'debug_action' )
				)
			);
		} else {
			echo wp_kses_post(
				sprintf(
				/* translators: %1%s: Missing tables (separated by ",") */
					__( 'One or more tables required for PooCommerce to function are missing, some features may not work as expected. Missing tables: %1$s.', 'poocommerce' ),
					esc_html( implode( ', ', $missing_tables ) )
				)
			);
		}
		?>
	</p>
</div>
