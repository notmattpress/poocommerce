<?php
/**
 * General Settings V4 controller unit tests.
 *
 * @package PooCommerce\RestApi\UnitTests
 * @since   4.0.0
 */

declare(strict_types=1);

/**
 * General Settings V4 controller unit tests.
 *
 * @package PooCommerce\RestApi\UnitTests
 * @since   4.0.0
 */
class WC_REST_General_Settings_V4_Controller_Test extends WC_REST_Unit_Test_Case {

	/**
	 * User ID.
	 *
	 * @var int
	 */
	private $user_id;

	/**
	 * @var callable
	 */
	private $feature_filter;
	/**
	 * @var string|false
	 */
	private $prev_default_country;

	/**
	 * Setup.
	 */
	public function setUp(): void {
		// Set up the feature flag before parent::setUp() to ensure the feature is enabled.
		$this->feature_filter = function ( $features ) {
			$features[] = 'rest-api-v4';
			return $features;
		};

		add_filter( 'poocommerce_admin_features', $this->feature_filter );

		parent::setUp();

		// This is to reset the country after the test.
		$this->prev_default_country = get_option( 'poocommerce_default_country' );

		// Create a user with permissions.
		$this->user_id = $this->factory->user->create(
			array(
				'role' => 'shop_manager',
			)
		);
	}

	/**
	 * Tear down.
	 */
	public function tearDown(): void {
		if ( isset( $this->feature_filter ) ) {
			remove_filter( 'poocommerce_admin_features', $this->feature_filter );
		}
		if ( isset( $this->prev_default_country ) ) {
			update_option( 'poocommerce_default_country', $this->prev_default_country );
		}
		delete_option( 'general_options' );
		delete_option( 'poocommerce_currency' );
		delete_option( 'poocommerce_price_num_decimals' );
		delete_option( 'poocommerce_share_key_display' );
		parent::tearDown();
	}

	/**
	 * Test route registration.
	 */
	public function test_register_routes() {
		$routes = $this->server->get_routes();
		$this->assertArrayHasKey( '/wc/v4/settings/general', $routes );
	}

	/**
	 * Test getting general settings.
	 */
	public function test_get_item() {
		wp_set_current_user( $this->user_id );
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/general' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 'general', $data['id'] );
		$this->assertArrayHasKey( 'values', $data );
		$this->assertArrayHasKey( 'groups', $data );
		$this->assertIsArray( $data['values'] );
		$this->assertIsArray( $data['groups'] );

		// Verify that values contains actual setting values.
		$this->assertArrayHasKey( 'poocommerce_default_country', $data['values'] );
		$this->assertIsString( $data['values']['poocommerce_default_country'] );
	}

	/**
	 * Test updating general settings with new values format.
	 */
	public function test_update_item() {
		wp_set_current_user( $this->user_id );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/general' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'values' => array(
						'poocommerce_default_country' => 'US:CA',
					),
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 'US:CA', get_option( 'poocommerce_default_country' ) );
		$this->assertArrayHasKey( 'values', $data );
		$this->assertArrayHasKey( 'groups', $data );
		$this->assertEquals( 'US:CA', $data['values']['poocommerce_default_country'] );
	}

	/**
	 * Test getting general settings without permission.
	 */
	public function test_get_item_without_permission() {
		wp_set_current_user( 0 );
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/general' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * Test updating general settings with backward compatibility (old format).
	 */
	public function test_update_item_backward_compatibility() {
		wp_set_current_user( $this->user_id );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/general' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'poocommerce_default_country' => 'US:NY',
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 'US:NY', get_option( 'poocommerce_default_country' ) );
		$this->assertArrayHasKey( 'values', $data );
		$this->assertArrayHasKey( 'groups', $data );
		$this->assertEquals( 'US:NY', $data['values']['poocommerce_default_country'] );
	}

	/**
	 * Test updating general settings without permission.
	 */
	public function test_update_item_without_permission() {
		wp_set_current_user( 0 );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/general' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'values' => array(
						'poocommerce_default_country' => 'US:CA',
					),
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$response->get_data();

		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * Test that poocommerce_share_key_display setting cannot be updated via REST API.
	 */
	public function test_update_share_key_display_not_allowed() {
		// Set an initial value.
		$initial_value = 'initial_value';
		update_option( 'poocommerce_share_key_display', $initial_value );

		wp_set_current_user( $this->user_id );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/general' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'values' => array(
						'poocommerce_share_key_display' => 'new_value',
						'poocommerce_default_country'   => 'US:CA', // Another setting to verify normal updates still work.
					),
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		// Verify the response is successful.
		$this->assertEquals( 200, $response->get_status() );

		// Verify poocommerce_share_key_display was not changed.
		$this->assertEquals( $initial_value, get_option( 'poocommerce_share_key_display' ) );

		// Verify other settings were updated successfully.
		$this->assertEquals( 'US:CA', get_option( 'poocommerce_default_country' ) );
		$this->assertEquals( 'US:CA', $data['values']['poocommerce_default_country'] );
	}

	/**
	 * Test update_item method does not update \'title\' and \'sectionend\' settings and other non-updatable fields.
	 */
	public function test_update_item_ignores_non_updatable_settings() {
		// Set an initial value for an option that corresponds to a 'title' type setting.
		// In WC_Settings_General, 'general_options' is often used as the ID for the main title section.
		$initial_title_value = 'initial_title_value';
		update_option( 'general_options', $initial_title_value );

		// Set initial values for other updatable options.
		update_option( 'poocommerce_currency', 'USD' );
		update_option( 'poocommerce_price_num_decimals', 2 );
		update_option( 'poocommerce_share_key_display', 'no' ); // Initial value, should not be updated.

		wp_set_current_user( $this->user_id );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/general' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'values' => array(
						'poocommerce_currency'           => 'EUR', // Should be updated.
						'poocommerce_price_num_decimals' => 3, // Should be updated.
						'general_options'                => 'updated_title_value', // Should NOT be updated.
						'poocommerce_share_key_display'  => 'yes', // Should NOT be updated (ignored by API).
					),
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );

		// Assert that actual updatable settings were updated.
		$this->assertEquals( 'EUR', get_option( 'poocommerce_currency' ) );
		$this->assertEquals( 3, get_option( 'poocommerce_price_num_decimals' ) );

		// Assert that 'title' and 'sectionend' typed settings (like 'general_options') are NOT updated.
		$this->assertEquals( $initial_title_value, get_option( 'general_options' ) );

		// Assert that poocommerce_share_key_display was ignored and remains its initial value.
		$this->assertEquals( 'no', get_option( 'poocommerce_share_key_display' ) );

		// Verify the response only contains updatable settings, and the ignored/non-updatable are not among them.
		$response_setting_ids = array();
		foreach ( $data['groups'] as $group ) {
			if ( isset( $group['fields'] ) && is_array( $group['fields'] ) ) {
				foreach ( $group['fields'] as $field ) {
					if ( isset( $field['id'] ) ) {
						$response_setting_ids[] = $field['id'];
					}
				}
			}
		}

		$this->assertContains( 'poocommerce_currency', $response_setting_ids );
		$this->assertContains( 'poocommerce_price_num_decimals', $response_setting_ids );
		$this->assertNotContains( 'general_options', $response_setting_ids ); // Should not be in response as updatable.
		$this->assertNotContains( 'poocommerce_share_key_display', $response_setting_ids ); // Should not be in response as updatable.
	}
}
