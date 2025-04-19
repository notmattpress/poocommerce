<?php
/**
 * Custom task example.
 *
 * @package PooCommerce\Admin
 */

use Automattic\PooCommerce\Admin\Features\OnboardingTasks\Task;

/**
 * Custom task class.
 */
class MyTask extends Task {
	/**
	 * Get the task ID.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'my-task';
	}

	/**
	 * Title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'My task', 'poocommerce' );
	}

	/**
	 * Content.
	 *
	 * @return string
	 */
	public function get_content() {
		return __( 'Add your task description here for display in the task list.', 'poocommerce' );
	}

	/**
	 * Time.
	 *
	 * @return string
	 */
	public function get_time() {
		return __( '2 minutes', 'poocommerce' );
	}
}
