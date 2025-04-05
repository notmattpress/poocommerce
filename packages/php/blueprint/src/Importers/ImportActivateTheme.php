<?php

namespace Automattic\PooCommerce\Blueprint\Importers;

use Automattic\PooCommerce\Blueprint\StepProcessor;
use Automattic\PooCommerce\Blueprint\StepProcessorResult;
use Automattic\PooCommerce\Blueprint\Steps\ActivatePlugin;
use Automattic\PooCommerce\Blueprint\Steps\ActivateTheme;
use Automattic\PooCommerce\Blueprint\UsePluginHelpers;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ImportActivateTheme
 *
 * @package Automattic\PooCommerce\Blueprint\Importers
 */
class ImportActivateTheme implements StepProcessor {
	use UsePluginHelpers;
	use UseWPFunctions;

	/**
	 * Process the step.
	 *
	 * @param object $schema The schema for the step.
	 *
	 * @return StepProcessorResult
	 */
	public function process( $schema ): StepProcessorResult {
		$result = StepProcessorResult::success( ActivateTheme::get_step_name() );
		// phpcs:ignore
		$name   = $schema->themeName;

		$switch = $this->wp_switch_theme( $name );
		$switch && $result->add_debug( "Switched theme to '{$name}'." );

		return $result;
	}

	/**
	 * Returns the class name of the step this processor handles.
	 *
	 * @return string The class name of the step this processor handles.
	 */
	public function get_step_class(): string {
		return ActivateTheme::class;
	}
}
