<?php

namespace Automattic\PooCommerce\Blocks\Domain\Services\OnboardingTasks;

use Automattic\PooCommerce\Blocks\Domain\Services\OnboardingTasks\ReviewCheckoutTask;
use Automattic\PooCommerce\Admin\Features\OnboardingTasks\TaskLists;

/**
 * Onboarding Tasks Controller
 */
class TasksController {

	/**
	 * Init tasks.
	 */
	public function init() {
		add_action( 'init', [ $this, 'register_tasks' ] );
	}

	/**
	 * Register tasks.
	 */
	public function register_tasks() {
		TaskLists::add_task(
			'extended',
			new ReviewCheckoutTask()
		);
	}
}
