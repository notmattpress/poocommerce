<?php
/**
 * Missing PooCommerce notice.
 *
 * @package WC_Beta_Tester\Admin\Views
 */

defined( 'ABSPATH' ) || exit;

?>

<div class="notice notice-error">
	<p>
		<?php
		// Translators: %s Plugin name.
		echo sprintf( esc_html__( '%s requires PooCommerce to be installed and activated in order to serve updates.', 'poocommerce-beta-tester' ), '<strong>' . esc_html__( 'PooCommerce Beta Tester', 'poocommerce-beta-tester' ) . '</strong>' );
		?>
	</p>

	<?php if ( ! is_plugin_active( 'poocommerce/poocommerce.php' ) && current_user_can( 'activate_plugin', 'poocommerce/poocommerce.php' ) ) : ?>
		<p>
			<?php
			$installed_plugins = get_plugins();
			if ( isset( $installed_plugins['poocommerce/poocommerce.php'] ) ) :
				?>
			<a href="<?php echo esc_url( wp_nonce_url( self_admin_url( 'plugins.php?action=activate&plugin=poocommerce/poocommerce.php&plugin_status=active' ), 'activate-plugin_poocommerce/poocommerce.php' ) ); ?>" class="button button-primary"><?php esc_html_e( 'Activate PooCommerce', 'poocommerce-beta-tester' ); ?></a>
			<?php endif; ?>
			<?php if ( current_user_can( 'deactivate_plugin', 'poocommerce-beta-tester/poocommerce-beta-tester.php' ) ) : ?>
				<a href="<?php echo esc_url( wp_nonce_url( 'plugins.php?action=deactivate&plugin=poocommerce-beta-tester/poocommerce-beta-tester.php&plugin_status=inactive', 'deactivate-plugin_poocommerce-beta-tester/poocommerce-beta-tester.php' ) ); ?>" class="button button-secondary"><?php esc_html_e( 'Turn off Beta Tester plugin', 'poocommerce-beta-tester' ); ?></a>
			<?php endif; ?>
		</p>
	<?php else : ?>
		<?php
		if ( current_user_can( 'install_plugins' ) ) {
			$url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=poocommerce' ), 'install-plugin_poocommerce' );
		} else {
			$url = 'http://wordpress.org/plugins/poocommerce/';
		}
		?>
		<p>
			<a href="<?php echo esc_url( $url ); ?>" class="button button-primary"><?php esc_html_e( 'Install PooCommerce', 'poocommerce-beta-tester' ); ?></a>
			<?php if ( current_user_can( 'deactivate_plugin', 'poocommerce-beta-tester/poocommerce-beta-tester.php' ) ) : ?>
				<a href="<?php echo esc_url( wp_nonce_url( 'plugins.php?action=deactivate&plugin=poocommerce-beta-tester/poocommerce-beta-tester.php&plugin_status=inactive', 'deactivate-plugin_poocommerce-beta-tester/poocommerce-beta-tester.php' ) ); ?>" class="button button-secondary"><?php esc_html_e( 'Turn off Beta Tester plugin', 'poocommerce-beta-tester' ); ?></a>
			<?php endif; ?>
		</p>
	<?php endif; ?>
</div>
