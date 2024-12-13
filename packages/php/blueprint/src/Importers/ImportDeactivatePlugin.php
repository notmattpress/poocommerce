<?php

namespace Automattic\PooCommerce\Blueprint\Importers;

use Automattic\PooCommerce\Blueprint\StepProcessor;
use Automattic\PooCommerce\Blueprint\StepProcessorResult;
use Automattic\PooCommerce\Blueprint\Steps\DeactivatePlugin;
use Automattic\PooCommerce\Blueprint\UsePluginHelpers;

/**
 * Class ImportDeactivatePlugin
 */
class ImportDeactivatePlugin implements StepProcessor {
	use UsePluginHelpers;

	/**
	 * Process the step.
	 *
	 * @param object $schema The schema to process.
	 *
	 * @return StepProcessorResult
	 */
	public function process( $schema ): StepProcessorResult {
		$result = StepProcessorResult::success( DeactivatePlugin::get_step_name() );
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$name = $schema->pluginName;

		$this->deactivate_plugin_by_slug( $name );
		$result->add_info( "Deactivated {$name}." );

		return $result;
	}

	/**
	 * Get the step class.
	 *
	 * @return string
	 */
	public function get_step_class(): string {
		return DeactivatePlugin::class;
	}
}
