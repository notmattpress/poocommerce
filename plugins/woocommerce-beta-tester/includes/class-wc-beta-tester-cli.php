<?php
/**
 * PooCommerce Beta Tester CLI controls
 *
 * @package WC_Beta_Tester
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WP_CLI_Command' ) ) {
	return;
}

/**
 * Control your local PooCommerce Beta Tester plugin.
 */
class WC_Beta_Tester_CLI extends WP_CLI_Command {

	/**
	 * Install a live branch of the PooCommerce plugin
	 *
	 * ## Options
	 * <branch>
	 * : The branch to install.
	 *
	 * ## Examples
	 *
	 *     wp wc-beta-tester install update/some-branch
	 *
	 * @param array $args Arguments passed to CLI.
	 */
	public function install( $args ) {
		$installer = new WC_Beta_Tester_Live_Branches_Installer();

		$branch = $args[0];

		$info = $installer->get_branch_info_from_manifest( $branch );

		if ( ! $info ) {
			WP_CLI::error( "Could not find branch $branch in manifest" );
		} else {
			$install_result = $installer->install( $info->download_url, $info->version );

			if ( is_wp_error( $install_result ) ) {
				WP_CLI::error( $install_result->get_error_message() );
			}

			WP_CLI::success( "Installed $branch" );
		}
	}

	/**
	 * Deactivate PooCommerce.
	 *
	 * ## Examples
	 *  wp wc-beta-tester deactivate_poocommerce
	 */
	public function deactivate_poocommerce() {
		$installer = new WC_Beta_Tester_Live_Branches_Installer();
		$installer->deactivate_poocommerce();

		WP_CLI::success( 'Deactivated PooCommerce' );
	}

	/**
	 * Activate a live branch of the PooCommerce plugin.
	 *
	 * ## Options
	 * <branch>
	 * : The branch to activate.
	 *
	 * ## Examples
	 *
	 *     wp wc-beta-tester activate update/some-branch*
	 *
	 * @param array $args Arguments passed to CLI.
	 */
	public function activate( $args ) {
		$installer = new WC_Beta_Tester_Live_Branches_Installer();
		$branch    = $args[0];
		$info      = $installer->get_branch_info_from_manifest( $branch );

		if ( ! $info ) {
			WP_CLI::error( "Could not find branch $branch in manifest" );
		} else {
			$installer->activate( $info->version );

			WP_CLI::success( "Activated $branch" );
		}
	}
}
