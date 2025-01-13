<?php

declare( strict_types = 1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Blueprint\Exporters\ExportsStep;
use Automattic\PooCommerce\Blueprint\Exporters\HasAlias;
use Automattic\PooCommerce\Blueprint\Exporters\StepExporter;
use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ExportWCTaskOptions
 *
 * This class exports PooCommerce task options and implements the StepExporter and HasAlias interfaces.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Exporters
 */
class ExportWCTaskOptions implements StepExporter, HasAlias {
	use UseWPFunctions;

	/**
	 * Export PooCommerce task options.
	 *
	 * @return SetSiteOptions
	 */
	public function export() {
		$step = new SetSiteOptions(
			array(
				'poocommerce_admin_customize_store_completed' => $this->wp_get_option( 'poocommerce_admin_customize_store_completed', 'no' ),
				'poocommerce_task_list_tracked_completed_actions' => $this->wp_get_option( 'poocommerce_task_list_tracked_completed_actions', array() ),
			)
		);

		$step->set_meta_values(
			array(
				'plugin' => 'poocommerce',
				'alias'  => $this->get_alias(),
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
		return 'setOptions';
	}

	/**
	 * Get the alias for this exporter.
	 *
	 * @return string
	 */
	public function get_alias() {
		return 'setWCTaskOptions';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Task Configurations', 'poocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description() {
		return __( 'It includes the task configurations for PooCommerce.', 'poocommerce' );
	}
}
