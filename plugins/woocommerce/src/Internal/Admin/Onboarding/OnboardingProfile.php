<?php
/**
 * PooCommerce Onboarding Setup Wizard
 */

namespace Automattic\PooCommerce\Internal\Admin\Onboarding;

use Automattic\PooCommerce\Admin\Features\OnboardingTasks\TaskLists;
use Automattic\PooCommerce\Admin\PageController;
use Automattic\PooCommerce\Admin\WCAdminHelper;

/**
 * Contains backend logic for the onboarding profile and checklist feature.
 */
class OnboardingProfile {
	/**
	 * Profile data option name.
	 */
	const DATA_OPTION = 'poocommerce_onboarding_profile';

	/**
	 * Option for storing the onboarding profile progress.
	 */
	const PROGRESS_OPTION = 'poocommerce_onboarding_profile_progress';

	/**
	 * Add onboarding actions.
	 */
	public static function init() {
		add_action( 'update_option_' . self::DATA_OPTION, array( __CLASS__, 'trigger_complete' ), 10, 2 );
	}

	/**
	 * Trigger the poocommerce_onboarding_profile_completed action
	 *
	 * @param array $old_value Previous value.
	 * @param array $value Current value.
	 */
	public static function trigger_complete( $old_value, $value ) {
		if ( isset( $old_value['completed'] ) && $old_value['completed'] ) {
			return;
		}

		if ( ! isset( $value['completed'] ) || ! $value['completed'] ) {
			return;
		}

		/**
		 * Action hook fired when the onboarding profile (or onboarding wizard,
		 * or profiler) is completed.
		 *
		 * @since 1.5.0
		 */
		do_action( 'poocommerce_onboarding_profile_completed' );
	}

	/**
	 * Check if the profiler still needs to be completed.
	 *
	 * @return bool
	 */
	public static function needs_completion() {
		$onboarding_data = get_option( self::DATA_OPTION, array() );

		$is_completed = isset( $onboarding_data['completed'] ) && true === $onboarding_data['completed'];
		$is_skipped   = isset( $onboarding_data['skipped'] ) && true === $onboarding_data['skipped'];

		// @todo When merging to PooCommerce Core, we should set the `completed` flag to true during the upgrade progress.
		// https://github.com/poocommerce/poocommerce-admin/pull/2300#discussion_r287237498.
		return ! $is_completed && ! $is_skipped;
	}
}
