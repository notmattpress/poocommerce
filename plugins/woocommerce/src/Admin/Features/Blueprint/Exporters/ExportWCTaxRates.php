<?php

declare( strict_types = 1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Admin\Features\Blueprint\Steps\SetWCTaxRates;
use Automattic\PooCommerce\Blueprint\Exporters\StepExporter;

/**
 * Class ExportWCTaxRates
 *
 * This class exports PooCommerce tax rates and implements the StepExporter interface.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Exporters
 */
class ExportWCTaxRates implements StepExporter {

	/**
	 * Export PooCommerce tax rates.
	 *
	 * @return SetWCTaxRates
	 */
	public function export() {
		global $wpdb;

		// Fetch tax rates from the database.
		$rates = $wpdb->get_results(
			"
            SELECT *
            FROM {$wpdb->prefix}poocommerce_tax_rates as tax_rates
            ",
			ARRAY_A
		);

		// Fetch tax rate locations from the database.
		$locations = $wpdb->get_results(
			"
            SELECT *
            FROM {$wpdb->prefix}poocommerce_tax_rate_locations as locations
            ",
			ARRAY_A
		);

		// Create a new SetWCTaxRates step with the fetched data.
		$step = new SetWCTaxRates( $rates, $locations );
		$step->set_meta_values(
			array(
				'plugin' => 'poocommerce',
			)
		);

		return $step;
	}

	/**
	 * Get the name of the step.
	 *
	 * @return string
	 */
	public function get_step_name() {
		return 'setWCTaxRates';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Tax Rates', 'poocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description() {
		return __( 'It includes tax rates and locations.', 'poocommerce' );
	}
}
