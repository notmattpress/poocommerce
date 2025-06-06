<?php

namespace Automattic\PooCommerce\Blueprint\Exporters;

use Automattic\PooCommerce\Blueprint\Steps\Step;

/**
 * Interface StepExporter
 *
 * A Step Exporter is responsible collecting data needed for a Step object and exporting it.
 * Refer to the Step class for the data needed as each step may require different data.
 */
interface StepExporter {
	/**
	 * Collect data needed for a Step object and export it.
	 *
	 * @return Step
	 */
	public function export();

	/**
	 * Returns the name of the step class it exports.
	 *
	 * @return string
	 */
	public function get_step_name();

	/**
	 * Check if the current user has the required capabilities for this step.
	 *
	 * @return bool True if the user has the required capabilities. False otherwise.
	 */
	public function check_step_capabilities(): bool;
}
