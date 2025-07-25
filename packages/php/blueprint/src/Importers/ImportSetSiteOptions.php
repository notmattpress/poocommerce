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
	 * List of WordPress options that should not be modified.
	 *
	 * @var array<string>
	 */
	private const RESTRICTED_OPTIONS = array(
		'siteurl',
		'home',
		'active_plugins',
		'template',
		'stylesheet',
		'admin_email',
		'unfiltered_html',
		'users_can_register',
		'default_role',
		'db_version',
		'cron',
		'rewrite_rules',
		'wp_user_roles',
	);

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
			// Skip if the option should not be modified.
			if ( in_array( $key, self::RESTRICTED_OPTIONS, true ) ) {
				$result->add_warn( "Cannot modify '{$key}' option: Modifying is restricted for this key." );
				continue;
			}

			$value         = json_decode( wp_json_encode( $value ), true );
			$updated       = $this->wp_update_option( $key, $value );
			$current_value = $this->wp_get_option( $key );

			if ( $current_value !== $value ) {
				$result->add_warn( "{$key} was intended to be set, but the stored value may have been overridden by a hook." );
				continue;
			}

			if ( $updated ) {
				$result->add_info( "{$key} has been updated." );
				continue;
			}

			if ( $current_value === $value ) {
				$result->add_info( "{$key} has not been updated because the current value is already up to date." );
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

	/**
	 * Check if the current user has the required capabilities for this step.
	 *
	 * @param object $schema The schema to process.
	 *
	 * @return bool True if the user has the required capabilities. False otherwise.
	 */
	public function check_step_capabilities( $schema ): bool {
		return current_user_can( 'manage_options' );
	}
}
