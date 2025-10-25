<?php

use Automattic\PooCommerce\Enums\OrderStatus;
use Automattic\PooCommerce\Internal\CostOfGoodsSold\CogsAwareUnitTestSuiteTrait;
use Automattic\PooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Automattic\PooCommerce\RestApi\UnitTests\HPOSToggleTrait;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\RestApi\UnitTests\Helpers\ProductHelper;

/**
 * class WC_REST_Orders_Controller_Tests.
 * Orders Controller tests for V3 REST API.
 */
class WC_REST_Orders_Controller_Tests extends WC_REST_Unit_Test_Case {
	use HPOSToggleTrait;
	use CogsAwareUnitTestSuiteTrait;

	/**
	 * Setup our test server, endpoints, and user info.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->endpoint = new WC_REST_Orders_Controller();
		$this->user     = $this->factory->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $this->user );
	}

	/**
	 * Get all expected fields.
	 *
	 * @param bool $with_cogs_enabled True to return the fields expected when the Cost of Goods Sold feature is enabled.
	 */
	public function get_expected_response_fields( bool $with_cogs_enabled ) {
		$fields = array(
			'id',
			'parent_id',
			'number',
			'order_key',
			'created_via',
			'version',
			'status',
			'currency',
			'date_created',
			'date_created_gmt',
			'date_modified',
			'date_modified_gmt',
			'discount_total',
			'discount_tax',
			'shipping_total',
			'shipping_tax',
			'cart_tax',
			'total',
			'total_tax',
			'prices_include_tax',
			'customer_id',
			'customer_ip_address',
			'customer_user_agent',
			'customer_note',
			'billing',
			'shipping',
			'payment_method',
			'payment_method_title',
			'transaction_id',
			'date_paid',
			'date_paid_gmt',
			'date_completed',
			'date_completed_gmt',
			'cart_hash',
			'meta_data',
			'line_items',
			'tax_lines',
			'shipping_lines',
			'fee_lines',
			'coupon_lines',
			'currency_symbol',
			'refunds',
			'payment_url',
			'is_editable',
			'needs_payment',
			'needs_processing',
		);

		if ( $with_cogs_enabled ) {
			$fields[] = 'cost_of_goods_sold';
		}

		return $fields;
	}

	/**
	 * @testWith [true]
	 *           [false]
	 *
	 * Test that all expected response fields are present.
	 * Note: This has fields hardcoded intentionally instead of fetching from schema to test for any bugs in schema result. Add new fields manually when added to schema.
	 *
	 * @param bool $with_cogs_enabled True to test with the Cost of Goods Sold feature enabled.
	 */
	public function test_orders_api_get_all_fields( bool $with_cogs_enabled ) {
		if ( $with_cogs_enabled ) {
			$this->enable_cogs_feature();
		}

		$expected_response_fields = $this->get_expected_response_fields( $with_cogs_enabled );

		$order    = \Automattic\PooCommerce\RestApi\UnitTests\Helpers\OrderHelper::create_order( $this->user );
		$response = $this->server->dispatch( new WP_REST_Request( 'GET', '/wc/v3/orders/' . $order->get_id() ) );

		$this->assertEquals( 200, $response->get_status() );

		$response_fields = array_keys( $response->get_data() );

		$this->assertEmpty( array_diff( $expected_response_fields, $response_fields ), 'These fields were expected but not present in API response: ' . print_r( array_diff( $expected_response_fields, $response_fields ), true ) );

		$this->assertEmpty( array_diff( $response_fields, $expected_response_fields ), 'These fields were not expected in the API response: ' . print_r( array_diff( $response_fields, $expected_response_fields ), true ) );
	}

	/**
	 * @testWith [true]
	 *
	 * Test that all fields are returned when requested one by one.
	 *
	 * @param bool $with_cogs_enabled True to test with the Cost of Goods Sold feature enabled.
	 */
	public function test_orders_get_each_field_one_by_one( bool $with_cogs_enabled ) {
		if ( $with_cogs_enabled ) {
			$this->enable_cogs_feature();
		}

		$expected_response_fields = $this->get_expected_response_fields( $with_cogs_enabled );
		$order                    = \Automattic\PooCommerce\RestApi\UnitTests\Helpers\OrderHelper::create_order( $this->user );

		foreach ( $expected_response_fields as $field ) {
			$request = new WP_REST_Request( 'GET', '/wc/v3/orders/' . $order->get_id() );
			$request->set_param( '_fields', $field );
			$response = $this->server->dispatch( $request );
			$this->assertEquals( 200, $response->get_status() );
			$response_fields = array_keys( $response->get_data() );

			$this->assertContains( $field, $response_fields, "Field $field was expected but not present in order API response." );
		}
	}

	/**
	 * Tests getting all orders with the REST API.
	 *
	 * @return void
	 */
	public function test_orders_get_all(): void {
		// Create a few orders.
		foreach ( range( 1, 5 ) as $i ) {
			$order = new \WC_Order();
			$order->save();
		}

		$request  = new \WP_REST_Request( 'GET', '/wc/v3/orders' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 5, $response->get_data() );
	}

	/**
	 * Tests filtering with the 'before' and 'after' params.
	 *
	 * @return void
	 */
	public function test_orders_date_filtering(): void {
		$time_before_orders = time();

		// Create a few orders for testing.
		$order_ids = array();
		foreach ( range( 1, 5 ) as $i ) {
			$order = new \WC_Order();
			$order->save();

			$order_ids[] = $order->get_id();
		}

		$time_after_orders = time() + HOUR_IN_SECONDS;

		$request = new \WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'dates_are_gmt', 1 );

		// No date params should return all orders.
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 5, $response->get_data() );

		// There are no orders before `$time_before_orders`.
		$request->set_param( 'before', gmdate( DateTime::ATOM, $time_before_orders ) );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 0, $response->get_data() );

		// All orders are before `$time_after_orders`.
		$request->set_param( 'before', gmdate( DateTime::ATOM, $time_after_orders ) );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 5, $response->get_data() );
	}

	/**
	 * Tests creating an order.
	 */
	public function test_orders_create(): void {
		$product                  = \Automattic\PooCommerce\RestApi\UnitTests\Helpers\ProductHelper::create_simple_product();
		$order_params             = array(
			'payment_method'       => WC_Gateway_BACS::ID,
			'payment_method_title' => 'Direct Bank Transfer',
			'set_paid'             => true,
			'billing'              => array(
				'first_name' => 'John',
				'last_name'  => 'Doe',
				'address_1'  => '969 Market',
				'address_2'  => '',
				'city'       => 'San Francisco',
				'state'      => 'CA',
				'postcode'   => '94103',
				'country'    => 'US',
				'email'      => 'john.doe@example.com',
				'phone'      => '(555) 555-5555',
			),
			'line_items'           => array(
				array(
					'product_id' => $product->get_id(),
					'quantity'   => 3,
				),
			),
		);
		$order_params['shipping'] = $order_params['billing'];

		$request = new \WP_REST_Request( 'POST', '/wc/v3/orders' );
		$request->set_body_params( $order_params );

		$response = $this->server->dispatch( $request );
		$this->assertEquals( 201, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayHasKey( 'id', $data );
		$this->assertEquals( OrderStatus::PROCESSING, $data['status'] );

		wp_cache_flush();

		// Fetch the order and compare some data.
		$order = wc_get_order( $data['id'] );
		$this->assertNotEmpty( $order );

		$this->assertEquals( (float) ( $product->get_price() * 3 ), (float) $order->get_total() );
		$this->assertEquals( $order_params['payment_method'], $order->get_payment_method( 'edit' ) );

		foreach ( array_keys( $order_params['billing'] ) as $address_key ) {
			$this->assertEquals( $order_params['billing'][ $address_key ], $order->{"get_billing_{$address_key}"}( 'edit' ) );
		}
	}

	/**
	 * Tests that the created_via parameter is properly stored when creating orders.
	 */
	public function test_order_created_via_param(): void {
		$product = \Automattic\PooCommerce\RestApi\UnitTests\Helpers\ProductHelper::create_simple_product();

		$order_params = array(
			'line_items'  => array(
				array(
					'product_id' => $product->get_id(),
					'quantity'   => 1,
				),
			),
			'created_via' => 'some_value',
		);

		$request = new \WP_REST_Request( 'POST', '/wc/v3/orders' );
		$request->set_body_params( $order_params );

		$response = $this->server->dispatch( $request );
		$this->assertEquals( 201, $response->get_status() );
		$data = $response->get_data();

		wp_cache_flush();

		$order = wc_get_order( $data['id'] );
		$this->assertNotEmpty( $order );
		$this->assertEquals( $order_params['created_via'], $order->get_created_via() );
	}

	/**
	 * Tests that the created_via parameter is set to 'rest-api' when empty.
	 */
	public function test_order_empty_created_via_param_is_set_to_rest_api() {
		$product = \Automattic\PooCommerce\RestApi\UnitTests\Helpers\ProductHelper::create_simple_product();

		$order_params = array(
			'line_items'  => array(
				array(
					'product_id' => $product->get_id(),
					'quantity'   => 1,
				),
			),
			'created_via' => '',
		);

		$request = new \WP_REST_Request( 'POST', '/wc/v3/orders' );
		$request->set_body_params( $order_params );

		$response = $this->server->dispatch( $request );
		$this->assertEquals( 201, $response->get_status() );
		$data = $response->get_data();

		wp_cache_flush();

		$order = wc_get_order( $data['id'] );
		$this->assertNotEmpty( $order );
		$this->assertEquals( 'rest-api', $order->get_created_via() );
	}

	/**
	 * Tests that the created_via parameter cannot be updated.
	 */
	public function test_created_via_cannot_be_updated() {
		$order = new \WC_Order();
		$order->set_created_via( 'original_value' );
		$order->save();

		$request = new \WP_REST_Request( 'PUT', '/wc/v3/orders/' . $order->get_id() );
		$request->set_body_params( array( 'created_via' => 'updated_value' ) );

		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertEquals( 'original_value', $data['created_via'] );
	}

	/**
	 * Describes the behavior of order creation (and updates) when the provided customer ID is valid
	 * as well as when it is invalid (ie, the customer does not belong to the current blog).
	 *
	 * @return void
	 */
	public function test_valid_and_invalid_customer_ids(): void {
		$customer_a = WC_Helper_Customer::create_customer( 'bob', 'staysafe', 'bob@rest-orders-controller.email' );
		$customer_b = WC_Helper_Customer::create_customer( 'bill', 'trustno1', 'bill@rest-orders-controller.email' );

		$request = new WP_REST_Request( 'POST', '/wc/v3/orders' );
		$request->set_body_params( array( 'customer_id' => $customer_a->get_id() ) );

		$response = $this->server->dispatch( $request );
		$order_id = $response->get_data()['id'];
		$this->assertEquals( 201, $response->get_status(), 'The order was created.' );
		$this->assertEquals( $customer_a->get_id(), $response->get_data()['customer_id'], 'The order is associated with the expected customer' );

		// Simulate a multisite network in which $customer_b is not a member of the blog.
		$legacy_proxy_mock = wc_get_container()->get( LegacyProxy::class );
		$legacy_proxy_mock->register_function_mocks(
			array(
				'is_multisite'           => function () {
					return true;
				},
				'is_user_member_of_blog' => function () {
					return false;
				},
			)
		);

		$request = new WP_REST_Request( 'POST', '/wc/v3/orders' );
		$request->set_body_params( array( 'customer_id' => $customer_b->get_id() ) );

		$response = $this->server->dispatch( $request );
		$this->assertEquals( 400, $response->get_status(), 'The order was not created, as the specified customer does not belong to the blog.' );
		$this->assertEquals( 'poocommerce_rest_invalid_customer_id', $response->get_data()['code'], 'The returned error indicates the customer ID was invalid.' );

		// Repeat the last test, except by performing an order update (instead of order creation).
		$request = new WP_REST_Request( 'PUT', '/wc/v3/orders/' . $order_id );
		$request->set_body_params( array( 'customer_id' => $customer_b->get_id() ) );

		$response = $this->server->dispatch( $request );
		$this->assertEquals( 400, $response->get_status(), 'The order was not updated, as the specified customer does not belong to the blog.' );
		$this->assertEquals( 'poocommerce_rest_invalid_customer_id', $response->get_data()['code'], 'The returned error indicates the customer ID was invalid.' );
	}

	/**
	 * Tests deleting an order.
	 */
	public function test_orders_delete(): void {
		$order = new \WC_Order();
		$order->set_status( OrderStatus::COMPLETED );
		$order->save();
		$order_id = $order->get_id();

		$request  = new \WP_REST_Request( 'DELETE', '/wc/v3/orders/' . $order_id );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		// Check that the response includes order data from the order (before deletion).
		$data = $response->get_data();
		$this->assertArrayHasKey( 'id', $data );
		$this->assertEquals( $data['id'], $order_id );
		$this->assertEquals( OrderStatus::COMPLETED, $data['status'] );

		wp_cache_flush();

		// Check the order was actually deleted.
		$order = wc_get_order( $order_id );
		$this->assertEquals( OrderStatus::TRASH, $order->get_status( 'edit' ) );
	}

	/**
	 * Test that the `include_meta` param filters the `meta_data` prop correctly.
	 */
	public function test_collection_param_include_meta() {
		// Create 3 orders.
		for ( $i = 1; $i <= 3; $i++ ) {
			$order = new \WC_Order();
			$order->add_meta_data( 'test1', 'test1', true );
			$order->add_meta_data( 'test2', 'test2', true );
			$order->save();
		}

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'include_meta', 'test1' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 3, $response_data );

		foreach ( $response_data as $order ) {
			$this->assertArrayHasKey( 'meta_data', $order );
			$this->assertEquals( 1, count( $order['meta_data'] ) );
			$meta_keys = array_map(
				function ( $meta_item ) {
					return $meta_item->get_data()['key'];
				},
				$order['meta_data']
			);
			$this->assertContains( 'test1', $meta_keys );
		}
	}

	/**
	 * Test that the `include_meta` param is skipped when empty.
	 */
	public function test_collection_param_include_meta_empty() {
		// Create 3 orders.
		for ( $i = 1; $i <= 3; $i++ ) {
			$order = new \WC_Order();
			$order->add_meta_data( 'test1', 'test1', true );
			$order->add_meta_data( 'test2', 'test2', true );
			$order->save();
		}

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'include_meta', '' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 3, $response_data );

		foreach ( $response_data as $order ) {
			$this->assertArrayHasKey( 'meta_data', $order );
			$meta_keys = array_map(
				function ( $meta_item ) {
					return $meta_item->get_data()['key'];
				},
				$order['meta_data']
			);
			$this->assertContains( 'test1', $meta_keys );
			$this->assertContains( 'test2', $meta_keys );
		}
	}

	/**
	 * Test that the `exclude_meta` param filters the `meta_data` prop correctly.
	 */
	public function test_collection_param_exclude_meta() {
		// Create 3 orders.
		for ( $i = 1; $i <= 3; $i++ ) {
			$order = new \WC_Order();
			$order->add_meta_data( 'test1', 'test1', true );
			$order->add_meta_data( 'test2', 'test2', true );
			$order->save();
		}

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'exclude_meta', 'test1' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 3, $response_data );

		foreach ( $response_data as $order ) {
			$this->assertArrayHasKey( 'meta_data', $order );
			$meta_keys = array_map(
				function ( $meta_item ) {
					return $meta_item->get_data()['key'];
				},
				$order['meta_data']
			);
			$this->assertContains( 'test2', $meta_keys );
			$this->assertNotContains( 'test1', $meta_keys );
		}
	}

	/**
	 * Test that the `include_meta` param overrides the `exclude_meta` param.
	 */
	public function test_collection_param_include_meta_override() {
		// Create 3 orders.
		for ( $i = 1; $i <= 3; $i++ ) {
			$order = new \WC_Order();
			$order->add_meta_data( 'test1', 'test1', true );
			$order->add_meta_data( 'test2', 'test2', true );
			$order->save();
		}

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'include_meta', 'test1' );
		$request->set_param( 'exclude_meta', 'test1' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 3, $response_data );

		foreach ( $response_data as $order ) {
			$this->assertArrayHasKey( 'meta_data', $order );
			$this->assertEquals( 1, count( $order['meta_data'] ) );
			$meta_keys = array_map(
				function ( $meta_item ) {
					return $meta_item->get_data()['key'];
				},
				$order['meta_data']
			);
			$this->assertContains( 'test1', $meta_keys );
		}
	}

	/**
	 * Test that the meta_data property contains an array, and not an object, after being filtered.
	 */
	public function test_collection_param_include_meta_returns_array() {
		$order = new \WC_Order();
		$order->add_meta_data( 'test1', 'test1', true );
		$order->add_meta_data( 'test2', 'test2', true );
		$order->save();

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'include_meta', 'test2' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data       = $this->server->response_to_data( $response, false );
		$encoded_data_string = wp_json_encode( $response_data );
		$decoded_data_object = json_decode( $encoded_data_string, false ); // Ensure object instead of associative array.

		$this->assertIsArray( $decoded_data_object[0]->meta_data );
	}

	/**
	 * Test that the `created_via` parameter is accepted when "custom orders table" is enabled.
	 */
	public function test_created_via_param_is_filters_order_when_cot_is_enabled() {
		update_option( CustomOrdersTableController::CUSTOM_ORDERS_TABLE_USAGE_ENABLED_OPTION, 'yes' );

		$order_checkout = WC_Helper_Order::create_order();
		$order_checkout->set_created_via( 'checkout' );
		$order_checkout->save();

		$order_admin = WC_Helper_Order::create_order();
		$order_admin->set_created_via( 'admin' );
		$order_admin->save();

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'created_via', array( 'checkout' ) );

		$response = rest_do_request( $request );
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();

		$this->assertIsArray( $data );
		$this->assertCount( 1, $data );
	}

	/**
	 * Test filtering orders with an invalid `created_via` value when "custom orders table" is enabled.
	 */
	public function test_get_orders_by_invalid_created_via_when_cot_is_enabled() {
		update_option( CustomOrdersTableController::CUSTOM_ORDERS_TABLE_USAGE_ENABLED_OPTION, 'yes' );

		$order_checkout = WC_Helper_Order::create_order();
		$order_checkout->set_created_via( 'checkout' );
		$order_checkout->save();

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'created_via', array( 'invalid_source' ) );

		$response = rest_do_request( $request );
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertEmpty( $data );
	}

	/**
	 * Test that the `created_via` parameter is accepted when "custom orders table" is enabled.
	 */
	public function test_created_via_param_is_filters_order_when_cot_is_disabled() {
		update_option( CustomOrdersTableController::CUSTOM_ORDERS_TABLE_USAGE_ENABLED_OPTION, 'no' );

		$order_checkout = WC_Helper_Order::create_order();
		$order_checkout->set_created_via( 'checkout' );
		$order_checkout->save();

		$order_admin = WC_Helper_Order::create_order();
		$order_admin->set_created_via( 'admin' );
		$order_admin->save();

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'created_via', array( 'checkout' ) );

		$response = rest_do_request( $request );
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();

		$this->assertIsArray( $data );
		$this->assertCount( 1, $data );
	}

	/**
	 * Test filtering orders with an invalid `created_via` value when "custom orders table" is disabled.
	 */
	public function test_get_orders_by_invalid_created_via_when_cot_is_disabled() {
		update_option( CustomOrdersTableController::CUSTOM_ORDERS_TABLE_USAGE_ENABLED_OPTION, 'no' );

		$order_checkout = WC_Helper_Order::create_order();
		$order_checkout->set_created_via( 'checkout' );
		$order_checkout->save();

		$request = new WP_REST_Request( 'GET', '/wc/v3/orders' );
		$request->set_param( 'created_via', array( 'invalid_source' ) );

		$response = rest_do_request( $request );
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertEmpty( $data );
	}

	/**
	 * @testdox When a line item quantity in an order is updated via REST API, the product's stock should also be updated.
	 */
	public function test_order_update_line_item_quantity_updates_product_stock() {
		$product = WC_Helper_Product::create_simple_product();
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 10 );
		$product->save();

		$request = new WP_REST_Request( 'POST', '/wc/v3/orders' );
		$request->set_body_params(
			array(
				'status'     => 'on-hold',
				'line_items' => array(
					array(
						'product_id' => $product->get_id(),
						'quantity'   => 4,
					),
				),
			)
		);
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 201, $response->get_status() );

		$product = wc_get_product( $product->get_id() );
		$this->assertEquals( 6, $product->get_stock_quantity() );

		$order = wc_get_order( $response->get_data()['id'] );
		$items = $order->get_items();
		$item  = reset( $items );

		$request = new WP_REST_Request( 'POST', '/wc/v3/orders/' . $order->get_id() );
		$request->set_body_params(
			array(
				'line_items' => array(
					array(
						'id'       => $item->get_id(),
						'quantity' => 5,
					),
				),
			)
		);
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$product = wc_get_product( $product );
		$this->assertEquals( 5, $product->get_stock_quantity() );
	}

	/**
	 * @testdox When a line item quantity in an order is updated via REST API, the product's stock should
	 *          only be updated when the order is set to certain statuses.
	 */
	public function test_order_update_line_item_quantity_only_updates_product_stock_on_status_change() {
		$product = WC_Helper_Product::create_simple_product();
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 10 );
		$product->save();

		$request = new WP_REST_Request( 'POST', '/wc/v3/orders' );
		$request->set_body_params(
			array(
				'status'     => 'auto-draft',
				'line_items' => array(
					array(
						'product_id' => $product->get_id(),
						'quantity'   => 4,
					),
				),
			)
		);
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 201, $response->get_status() );

		$product = wc_get_product( $product->get_id() );
		$this->assertEquals( 10, $product->get_stock_quantity() );

		$order = wc_get_order( $response->get_data()['id'] );

		$request = new WP_REST_Request( 'POST', '/wc/v3/orders/' . $order->get_id() );
		$request->set_body_params(
			array(
				'status' => 'processing',
			)
		);
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$product = wc_get_product( $product );
		$this->assertEquals( 6, $product->get_stock_quantity() );
	}

	/**
	 * @testdox When a line item in an order is removed via REST API, the product's stock should also be updated.
	 */
	public function test_order_remove_line_item_updates_product_stock() {
		require_once WC_ABSPATH . 'includes/admin/wc-admin-functions.php';

		$product = WC_Helper_Product::create_simple_product();
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 10 );
		$product->save();

		$order = WC_Helper_Order::create_order( 1, $product, array( 'status' => OrderStatus::ON_HOLD ) ); // Initial qty of 4.
		$items = $order->get_items();
		$item  = reset( $items );
		wc_maybe_adjust_line_item_product_stock( $item );

		$product = wc_get_product( $product->get_id() );
		$this->assertEquals( 6, $product->get_stock_quantity() );

		$request = new WP_REST_Request( 'POST', '/wc/v3/orders/' . $order->get_id() );
		$request->set_body_params(
			array(
				'line_items' => array(
					array(
						'id'       => $item->get_id(),
						'quantity' => 0,
					),
				),
			)
		);
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$order = wc_get_order( $order );
		$this->assertEmpty( $order->get_items() );

		$product = wc_get_product( $product );
		$this->assertEquals( 10, $product->get_stock_quantity() );
	}

	/**
	 * @testdox The retrieved order data doesn't include Cost of Goods Sold information if the feature is disabled.
	 */
	public function test_retrieved_order_does_not_include_cogs_info_if_feature_is_disabled() {
		$this->enable_cogs_feature();
		$this->toggle_cot_feature_and_usage( true );

		$order = new WC_Order();
		$this->add_product_with_cogs_to_order( $order, 12.34, 2 );
		$order->calculate_cogs_total_value();
		$order->save();

		$this->disable_cogs_feature();

		$request  = new \WP_REST_Request( 'GET', '/wc/v3/orders/' . $order->get_id() );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayNotHasKey( 'cost_of_goods_sold', $data );

		foreach ( $data['line_items'] as $item ) {
			$this->assertArrayNotHasKey( 'cost_of_goods_sold', $item );
		}
	}

	/**
	 * @testdox The retrieved order data includes Cost of Goods Sold information if the feature is enabled.
	 */
	public function test_retrieved_order_includes_cogs_info_if_feature_is_enabled() {
		$this->enable_cogs_feature();
		$this->toggle_cot_feature_and_usage( true );

		$order = new WC_Order();
		$this->add_product_with_cogs_to_order( $order, 12.34, 2 );
		$this->add_product_with_cogs_to_order( $order, 56.78, 3 );
		$order->calculate_cogs_total_value();
		$order->save();

		$request  = new \WP_REST_Request( 'GET', '/wc/v3/orders/' . $order->get_id() );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertEquals( 12.34 * 2 + 56.78 * 3, (float) $data['cost_of_goods_sold']['total_value'] );

		$items = $data['line_items'];
		usort( $items, fn( $a, $b ) => $a['id'] - $b['id'] );
		$this->assertEquals( 12.34 * 2, (float) $items[0]['cost_of_goods_sold']['value'] );
		$this->assertEquals( 56.78 * 3, (float) $items[1]['cost_of_goods_sold']['value'] );
	}

	/**
	 * Add a product order item with a given Cost of Goods Sold to an exising order.
	 *
	 * @param WC_Order $order The target order.
	 * @param float    $cogs_value The COGS value of the product.
	 * @param int      $quantity The quantity of the order item.
	 */
	private function add_product_with_cogs_to_order( WC_Order $order, float $cogs_value, int $quantity ) {
		$product = WC_Helper_Product::create_simple_product();
		$product->set_cogs_value( $cogs_value );
		$product->save();
		$item = new WC_Order_Item_Product();
		$item->set_product( $product );
		$item->set_quantity( $quantity );
		$item->save();
		$order->add_item( $item );
	}
}
