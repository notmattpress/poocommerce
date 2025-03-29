<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Blueprint\Exporters\HasAlias;
use Automattic\PooCommerce\Blueprint\Exporters\StepExporter;
use Automattic\PooCommerce\Blueprint\Steps\RunSql;
use Automattic\PooCommerce\Blueprint\Util;

/**
 * Class ExportWCTaxRates
 *
 * This class exports PooCommerce tax rates and implements the StepExporter interface.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Exporters
 */
class ExportWCTaxRates implements StepExporter, HasAlias {

	/**
	 * Export PooCommerce tax rates.
	 *
	 * @return array RunSql
	 */
	public function export(): array {
		return array_merge(
			$this->generateSteps( 'poocommerce_tax_rates' ),
			$this->generateSteps( 'poocommerce_tax_rate_locations' )
		);
	}

	/**
	 * Generate SQL steps for exporting data.
	 *
	 * @param string $table Table identifier.
	 * @return array Array of RunSql steps.
	 */
	private function generateSteps( string $table ): array {
		global $wpdb;
		$table = $wpdb->prefix . $table;
		return array_map(
			fn( $record ) => new RunSql( Util::array_to_insert_sql( $record, $table, 'replace into' ) ),
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$wpdb->get_results( "SELECT * FROM {$table}", ARRAY_A )
		);
	}

	/**
	 * Get the name of the step.
	 *
	 * @return string Step name.
	 */
	public function get_step_name(): string {
		return 'runSql';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string Label text.
	 */
	public function get_label(): string {
		return __( 'Tax', 'poocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string Description text.
	 */
	public function get_description(): string {
		return __( 'Includes all settings in PooCommerce | Settings | Tax.', 'poocommerce' );
	}

	/**
	 * Get the alias.
	 *
	 * @return string Alias name.
	 */
	public function get_alias(): string {
		return 'setWCTaxRates';
	}
}
