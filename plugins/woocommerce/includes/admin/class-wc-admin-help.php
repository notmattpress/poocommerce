<?php
/**
 * Add some content to the help tab
 *
 * @package     PooCommerce\Admin
 * @version     2.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'WC_Admin_Help', false ) ) {
	return new WC_Admin_Help();
}

/**
 * WC_Admin_Help Class.
 */
class WC_Admin_Help {

	/**
	 * Hook in tabs.
	 */
	public function __construct() {
		add_action( 'current_screen', array( $this, 'add_tabs' ), 50 );
	}

	/**
	 * Add help tabs.
	 */
	public function add_tabs() {
		$screen = get_current_screen();

		if ( ! $screen || ! in_array( $screen->id, wc_get_screen_ids() ) ) {
			return;
		}

		$screen->add_help_tab(
			array(
				'id'      => 'poocommerce_support_tab',
				'title'   => __( 'Help &amp; Support', 'poocommerce' ),
				'content' =>
					'<h2>' . __( 'Help &amp; Support', 'poocommerce' ) . '</h2>' .
					'<p>' . sprintf(
						/* translators: %s: Documentation URL */
						__( 'Should you need help understanding, using, or extending PooCommerce, <a href="%s">please read our documentation</a>. You will find all kinds of resources including snippets, tutorials and much more.', 'poocommerce' ),
						'https://poocommerce.com/documentation/plugins/poocommerce/?utm_source=helptab&utm_medium=product&utm_content=docs&utm_campaign=poocommerceplugin'
					) . '</p>' .
					'<p>' . sprintf(
						/* translators: %s: Forum URL */
						__( 'For further assistance with PooCommerce core, use the <a href="%1$s">community forum</a>. For help with premium extensions sold on PooCommerce.com, <a href="%2$s">open a support request at PooCommerce.com</a>.', 'poocommerce' ),
						'https://wordpress.org/support/plugin/poocommerce',
						'https://poocommerce.com/my-account/create-a-ticket/?utm_source=helptab&utm_medium=product&utm_content=tickets&utm_campaign=poocommerceplugin'
					) . '</p>' .
					'<p>' . __( 'Before asking for help, we recommend checking the system status page to identify any problems with your configuration.', 'poocommerce' ) . '</p>' .
					'<p><a href="' . admin_url( 'admin.php?page=wc-status' ) . '" class="button button-primary">' . __( 'System status', 'poocommerce' ) . '</a> <a href="https://wordpress.org/support/plugin/poocommerce" class="button">' . __( 'Community forum', 'poocommerce' ) . '</a> <a href="https://poocommerce.com/my-account/create-a-ticket/?utm_source=helptab&utm_medium=product&utm_content=tickets&utm_campaign=poocommerceplugin" class="button">' . __( 'PooCommerce.com support', 'poocommerce' ) . '</a></p>',
			)
		);

		$screen->add_help_tab(
			array(
				'id'      => 'poocommerce_bugs_tab',
				'title'   => __( 'Found a bug?', 'poocommerce' ),
				'content' =>
					'<h2>' . __( 'Found a bug?', 'poocommerce' ) . '</h2>' .
					/* translators: 1: GitHub issues URL 2: GitHub contribution guide URL 3: System status report URL */
					'<p>' . sprintf( __( 'If you find a bug within PooCommerce core you can create a ticket via <a href="%1$s">GitHub issues</a>. Ensure you read the <a href="%2$s">contribution guide</a> prior to submitting your report. To help us solve your issue, please be as descriptive as possible and include your <a href="%3$s">system status report</a>.', 'poocommerce' ), 'https://github.com/poocommerce/poocommerce/issues?state=open', 'https://github.com/poocommerce/poocommerce/blob/trunk/.github/CONTRIBUTING.md', admin_url( 'admin.php?page=wc-status' ) ) . '</p>' .
					'<p><a href="https://github.com/poocommerce/poocommerce/issues/new?assignees=&labels=&template=1-bug-report.yml" class="button button-primary">' . __( 'Report a bug', 'poocommerce' ) . '</a> <a href="' . admin_url( 'admin.php?page=wc-status' ) . '" class="button">' . __( 'System status', 'poocommerce' ) . '</a></p>',

			)
		);

		$screen->set_help_sidebar(
			'<p><strong>' . __( 'For more information:', 'poocommerce' ) . '</strong></p>' .
			'<p><a href="https://poocommerce.com/?utm_source=helptab&utm_medium=product&utm_content=about&utm_campaign=poocommerceplugin" target="_blank">' . __( 'About PooCommerce', 'poocommerce' ) . '</a></p>' .
			'<p><a href="https://wordpress.org/plugins/poocommerce/" target="_blank">' . __( 'WordPress.org project', 'poocommerce' ) . '</a></p>' .
			'<p><a href="https://github.com/poocommerce/poocommerce/" target="_blank">' . __( 'GitHub project', 'poocommerce' ) . '</a></p>' .
			'<p><a href="https://poocommerce.com/product-category/themes/?utm_source=helptab&utm_medium=product&utm_content=wcthemes&utm_campaign=poocommerceplugin" target="_blank">' . __( 'Official themes', 'poocommerce' ) . '</a></p>' .
			'<p><a href="https://poocommerce.com/product-category/poocommerce-extensions/?utm_source=helptab&utm_medium=product&utm_content=wcextensions&utm_campaign=poocommerceplugin" target="_blank">' . __( 'Official extensions', 'poocommerce' ) . '</a></p>'
		);
	}
}

return new WC_Admin_Help();
