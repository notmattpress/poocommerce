<?php
/**
 * Unit tests for the DueDispatcher schedule check without Action Scheduler.
 *
 * @package Automattic\PooCommerce\SubscriptionsEngine
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\SubscriptionsEngine\Tests\Unit\Integration\Dispatch;

use PHPUnit\Framework\TestCase;
use Automattic\PooCommerce\SubscriptionsEngine\Integration\Dispatch\DueDispatcher;

/**
 * The unit suite loads neither WordPress nor Action Scheduler, the state a deactivation
 * hook runs in while PooCommerce is inactive.
 *
 * @covers \Automattic\PooCommerce\SubscriptionsEngine\Integration\Dispatch\DueDispatcher
 */
class DueDispatcherWithoutActionSchedulerTest extends TestCase {

	/**
	 * @testdox ensure_scheduled is a no-op when Action Scheduler is not loaded.
	 */
	public function test_ensure_scheduled_is_a_no_op_without_action_scheduler(): void {
		$this->assertFalse( function_exists( 'as_unschedule_all_actions' ), 'Precondition: Action Scheduler is not loaded.' );

		DueDispatcher::ensure_scheduled();

		$this->addToAssertionCount( 1 );
	}
}
