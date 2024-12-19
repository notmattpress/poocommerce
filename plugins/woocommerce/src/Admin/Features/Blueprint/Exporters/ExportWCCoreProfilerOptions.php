<?php

declare( strict_types = 1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Blueprint\Exporters\StepExporter;
use Automattic\PooCommerce\Blueprint\Exporters\HasAlias;
use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * ExportWCCoreProfilerOptions class
 */
class ExportWCCoreProfilerOptions implements StepExporter, HasAlias {
	use UseWPFunctions;

	/**
	 * Export the step
	 *
	 * @return SetSiteOptions
	 */
	public function export() {
		$step = new SetSiteOptions(
			array(
				'blogname'                       => $this->wp_get_option( 'blogname' ),
				'poocommerce_allow_tracking'     => $this->wp_get_option( 'poocommerce_allow_tracking' ),
				'poocommerce_onboarding_profile' => $this->wp_get_option( 'poocommerce_onboarding_profile', array() ),
				'poocommerce_default_country'    => $this->wp_get_option( 'poocommerce_default_country' ),
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
	 * Get the step name
	 *
	 * @return string
	 */
	public function get_step_name() {
		return 'setSiteOptions';
	}

	/**
	 * Get the alias
	 *
	 * @return string
	 */
	public function get_alias() {
		return 'setWCCoreProfilerOptions';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Onboarding Configuration', 'poocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description() {
		return __( 'It includes onboarding configuration options', 'poocommerce' );
	}
}
