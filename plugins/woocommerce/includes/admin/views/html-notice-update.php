<?php
/**
 * Admin View: Notice - Update
 *
 * @package PooCommerce\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$update_url = wp_nonce_url(
	add_query_arg( 'do_update_poocommerce', 'true', admin_url( 'admin.php?page=wc-settings' ) ),
	'wc_db_update',
	'wc_db_update_nonce'
);

?>
<div id="message" class="updated poocommerce-message wc-connect">
	<p>
		<strong><?php esc_html_e( 'PooCommerce database update required', 'poocommerce' ); ?></strong>
	</p>
	<p>
		<?php
			esc_html_e( 'PooCommerce has been updated! To keep things running smoothly, we have to update your database to the newest version.', 'poocommerce' );

			/* translators: 1: Link to docs 2: Close link. */
			printf( ' ' . esc_html__( 'The database update process runs in the background and may take a little while, so please be patient. Advanced users can alternatively update via %1$sWP CLI%2$s.', 'poocommerce' ), '<a href="https://github.com/poocommerce/poocommerce/wiki/Upgrading-the-database-using-WP-CLI">', '</a>' );
		?>
	</p>
	<p class="submit">
		<a href="<?php echo esc_url( $update_url ); ?>" class="wc-update-now button-primary">
			<?php esc_html_e( 'Update PooCommerce Database', 'poocommerce' ); ?>
		</a>
		<a href="https://poocommerce.com/document/how-to-update-poocommerce/" class="button-secondary">
			<?php esc_html_e( 'Learn more about updates', 'poocommerce' ); ?>
		</a>
	</p>
</div>
