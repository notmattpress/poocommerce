<?php

declare( strict_types = 1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ExportWCSettingsAccount
 *
 * This class exports PooCommerce settings on the Account and Privacy page.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Exporters
 */
class ExportWCSettingsAccount extends ExportWCSettings {
	use UseWPFunctions;

	/**
	 * Get the alias for this exporter.
	 *
	 * @return string
	 */
	public function get_alias() {
		return 'setWCSettingsAccount';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Account and Privacy', 'poocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description() {
		return __( 'Includes all settings in PooCommerce | Settings | Account and Privacy.', 'poocommerce' );
	}

	/**
	 * Get the page ID for the settings page.
	 *
	 * @return string
	 */
	protected function get_page_id(): string {
		return 'account';
	}
}
