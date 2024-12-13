<?php

namespace Automattic\PooCommerce\Blueprint\Importers;

use Automattic\PooCommerce\Blueprint\StepProcessor;
use Automattic\PooCommerce\Blueprint\StepProcessorResult;
use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ImportSetSiteOptions
 *
 * Importer for the SetSiteOptions step.
 *
 * @package Automattic\PooCommerce\Blueprint\Importers
 */
class ImportSetSiteOptions implements StepProcessor {
	use UseWPFunctions;

	/**
	 * Process the step.
	 *
	 * @param object $schema The schema to process.
	 *
	 * @return StepProcessorResult
	 */
	public function process( $schema ): StepProcessorResult {
		$result = StepProcessorResult::success( SetSiteOptions::get_step_name() );
		foreach ( $schema->options as $key => $value ) {
			if ( is_object( $value ) ) {
				$value = (array) $value;
			}

			$updated = $this->wp_update_option( $key, $value );

			if ( $updated ) {
				$result->add_info( "{$key} has been updated" );
			} else {
				$current_value = $this->wp_get_option( $key );
				if ( $current_value === $value ) {
					$result->add_info( "{$key} has not been updated because the current value is already up to date." );
				}
			}
		}

		return $result;
	}

	/**
	 * Get the step class.
	 *
	 * @return string
	 */
	public function get_step_class(): string {
		return SetSiteOptions::class;
	}
}
