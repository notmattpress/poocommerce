<?php

declare( strict_types = 1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Admin\Features\Blueprint\SettingOptions;
use Automattic\PooCommerce\Blueprint\Exporters\HasAlias;
use Automattic\PooCommerce\Blueprint\Exporters\StepExporter;
use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ExportWCSettings
 *
 * This abstract class provides the functionality for exporting PooCommerce settings on a specific page.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Exporters
 */
abstract class ExportWCSettings implements StepExporter, HasAlias {
	use UseWPFunctions;

	/**
	 * Return a page I.D to export.
	 *
	 * @return string The page ID.
	 */
	abstract protected function get_page_id(): string;

	/**
	 * Export PooCommerce settings.
	 *
	 * @return SetSiteOptions
	 */
	public function export() {
		$setting_options = new SettingOptions();
		return new SetSiteOptions( $setting_options->get_page_options( $this->get_page_id() ) );
	}


	/**
	 * Get the name of the step.
	 *
	 * @return string
	 */
	public function get_step_name() {
		return 'setSiteOptions';
	}

	/**
	 * Get the alias for this exporter.
	 *
	 * @return string
	 */
	public function get_alias() {
		return 'setWCSettingsGeneral';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'General', 'poocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description() {
		return __( 'Includes all settings in PooCommerce | Settings | General.', 'poocommerce' );
	}
}
