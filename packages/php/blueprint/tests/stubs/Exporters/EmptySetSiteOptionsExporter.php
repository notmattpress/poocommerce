<?php

namespace Automattic\PooCommerce\Blueprint\Tests\stubs\Exporters;

use Automattic\PooCommerce\Blueprint\Exporters\StepExporter;
use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;

/**
 * Class EmptySetSiteOptionsExporter
 *
 * Exports an empty SetSiteOptions step for testing.
 */
class EmptySetSiteOptionsExporter implements StepExporter {
	/**
	 * Export the step.
	 *
	 * @return SetSiteOptions
	 */
	public function export() {
		return new SetSiteOptions( array() );
	}

	/**
	 * Get the step name.
	 *
	 * @return string The step name.
	 */
	public function get_step_name() {
		return SetSiteOptions::get_step_name();
	}

	/**
	 * Check if the step is capable of being exported.
	 *
	 * @return bool True if the step is capable of being exported, false otherwise.
	 */
	public function check_step_capabilities(): bool {
		return true;
	}
}
