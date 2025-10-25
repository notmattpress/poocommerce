<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\StoreApi\Routes;

use Automattic\PooCommerce\Blocks\Patterns\PTKPatternsStore;

/**
 * Patterns Controller Tests.
 */
class Patterns extends ControllerTestCase {
	/**
	 * Set up user for tests.
	 */
	public function setUp(): void {
		parent::setUp();

		$user = $this->factory->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user );
	}

	/**
	 * Test the post endpoint when tracking is not allowed.
	 *
	 * @return void
	 */
	public function test_post_endpoint_when_tracking_is_not_allowed() {
		update_option( 'poocommerce_allow_tracking', 'no' );

		$response = rest_get_server()->dispatch( new \WP_REST_Request( 'POST', '/wc/private/patterns' ) );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( true, $data['success'] );

		$patterns = get_option( PTKPatternsStore::OPTION_NAME );
		$this->assertFalse( $patterns );
	}

	/**
	 * Test the post endpoint when tracking is allowed.
	 *
	 * @return void
	 */
	public function test_post_endpoint_when_tracking_is_allowed() {
		update_option( 'poocommerce_allow_tracking', 'yes' );

		$response = rest_get_server()->dispatch( new \WP_REST_Request( 'POST', '/wc/private/patterns' ) );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( true, $data['success'] );

		$patterns = get_option( PTKPatternsStore::OPTION_NAME );
		$this->assertNotFalse( $patterns );
	}
}
