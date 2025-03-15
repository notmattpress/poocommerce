<?php

namespace Automattic\PooCommerce\Blueprint\Importers;

use Automattic\PooCommerce\Blueprint\StepProcessor;
use Automattic\PooCommerce\Blueprint\StepProcessorResult;
use Automattic\PooCommerce\Blueprint\Steps\ActivatePlugin;
use Automattic\PooCommerce\Blueprint\Steps\ActivateTheme;
use Automattic\PooCommerce\Blueprint\Steps\RunSql;
use Automattic\PooCommerce\Blueprint\UsePluginHelpers;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ImportRunSql
 *
 * @package Automattic\PooCommerce\Blueprint\Importers
 */
class ImportRunSql implements StepProcessor {
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
		global $wpdb;
		$result = StepProcessorResult::success( RunSql::get_step_name() );

		$wpdb->query( $schema->sql->contents );
		if ($wpdb->last_error) {
			$result->add_error( "Error executing SQL: {$wpdb->last_error}" );
		} else {
			$result->add_debug( "Executed SQL ({$schema->sql->name}): {$schema->sql->contents}" );
		}

		return $result;
	}

	/**
	 * Returns the class name of the step this processor handles.
	 *
	 * @return string The class name of the step this processor handles.
	 */
	public function get_step_class(): string {
		return RunSql::class;
	}
}
