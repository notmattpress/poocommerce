<?php

declare( strict_types = 1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ExportWCSettingsIntegrations
 *
 * This class exports PooCommerce settings on the Integrations page.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Exporters
 */
class ExportWCSettingsIntegrations extends ExportWCSettings {
	use UseWPFunctions;

	/**
	 * Get the alias for this exporter.
	 *
	 * @return string
	 */
	public function get_alias() {
		return 'setWCSettingsIntegrations';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Integrations', 'poocommerce' );
	}

	/**
	 * Export PooCommerce settings.
	 *
	 * @return SetSiteOptions
	 */
	public function export() {
		if ( ! isset( WC()->integrations ) ) {
			return new SetSiteOptions( array() );
		}

		$integrations = WC()->integrations->get_integrations();

		$settings = array();
		foreach ( $integrations as $integration ) {
			$option_key              = $integration->get_option_key();
			$settings[ $option_key ] = get_option( $option_key, null );
		}

		return new SetSiteOptions( $settings );
	}


	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description() {
		return __( 'Includes all settings in PooCommerce | Settings | Integrations.', 'poocommerce' );
	}

	/**
	 * Get the page ID for the settings page.
	 *
	 * @return string
	 */
	protected function get_page_id(): string {
		return 'integration';
	}
}
