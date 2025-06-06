<?php

use Automattic\PooCommerce\Utilities\ArrayUtil;

/**
 * class WC_REST_Products_Controller_Tests.
 * Product Controller tests for V2 REST API.
 */
class WC_REST_Products_V2_Controller_Test extends WC_REST_Unit_Test_Case {
	/**
	 * @var WC_Product_Simple[]
	 */
	protected static $products = array();

	/**
	 * Create products for tests.
	 *
	 * @return void
	 */
	public static function wpSetUpBeforeClass() {
		for ( $i = 1; $i <= 4; $i++ ) {
			self::$products[] = WC_Helper_Product::create_simple_product();
		}

		foreach ( self::$products as $product ) {
			$product->add_meta_data( 'test1', 'test1', true );
			$product->add_meta_data( 'test2', 'test2', true );
			$product->save();
		}
	}

	/**
	 * Clean up products after tests.
	 *
	 * @return void
	 */
	public static function wpTearDownAfterClass() {
		foreach ( self::$products as $product ) {
			WC_Helper_Product::delete_product( $product->get_id() );
		}
	}

	/**
	 * Setup our test server, endpoints, and user info.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->endpoint = new WC_REST_Products_V2_Controller();
		$this->user     = $this->factory->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $this->user );
	}

	/**
	 * Get all expected fields.
	 */
	public function get_expected_response_fields() {
		return array(
			'id',
			'name',
			'slug',
			'permalink',
			'date_created',
			'date_created_gmt',
			'date_modified',
			'date_modified_gmt',
			'type',
			'status',
			'featured',
			'catalog_visibility',
			'description',
			'short_description',
			'sku',
			'price',
			'regular_price',
			'sale_price',
			'date_on_sale_from',
			'date_on_sale_from_gmt',
			'date_on_sale_to',
			'date_on_sale_to_gmt',
			'price_html',
			'on_sale',
			'purchasable',
			'total_sales',
			'virtual',
			'downloadable',
			'downloads',
			'download_limit',
			'download_expiry',
			'external_url',
			'button_text',
			'tax_status',
			'tax_class',
			'manage_stock',
			'stock_quantity',
			'in_stock',
			'backorders',
			'backorders_allowed',
			'backordered',
			'sold_individually',
			'weight',
			'dimensions',
			'shipping_required',
			'shipping_taxable',
			'shipping_class',
			'shipping_class_id',
			'reviews_allowed',
			'average_rating',
			'rating_count',
			'related_ids',
			'upsell_ids',
			'cross_sell_ids',
			'parent_id',
			'purchase_note',
			'categories',
			'tags',
			'brands',
			'images',
			'attributes',
			'default_attributes',
			'variations',
			'grouped_products',
			'menu_order',
			'meta_data',
		);
	}

	/**
	 * Test that all expected response fields are present.
	 * Note: This has fields hardcoded intentionally instead of fetching from schema to test for any bugs in schema result. Add new fields manually when added to schema.
	 */
	public function test_product_api_get_all_fields_v2() {
		$expected_response_fields = $this->get_expected_response_fields();

		$product  = \Automattic\PooCommerce\RestApi\UnitTests\Helpers\ProductHelper::create_simple_product();
		$response = $this->server->dispatch( new WP_REST_Request( 'GET', '/wc/v2/products/' . $product->get_id() ) );

		$this->assertEquals( 200, $response->get_status() );

		$response_fields = array_keys( $response->get_data() );

		// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_print_r
		$this->assertEmpty( array_diff( $expected_response_fields, $response_fields ), 'These fields were expected but not present in API V2 response: ' . print_r( array_diff( $expected_response_fields, $response_fields ), true ) );

		$this->assertEmpty( array_diff( $response_fields, $expected_response_fields ), 'These fields were not expected in the API V2 response: ' . print_r( array_diff( $response_fields, $expected_response_fields ), true ) );
		// phpcs:enable WordPress.PHP.DevelopmentFunctions.error_log_print_r
	}

	/**
	 * Test that `get_product_data` function works without silent `request` parameter as it used to.
	 * TODO: Fix the underlying design issue when DI gets available.
	 */
	public function test_get_product_data_should_work_without_request_param() {
		$product = WC_Helper_Product::create_simple_product();
		$product->save();
		// Workaround to call protected method.
		$call_product_data_wrapper = function () use ( $product ) {
			return $this->get_product_data( $product );
		};
		$response                  = $call_product_data_wrapper->call( new WC_REST_Products_Controller() );
		$this->assertArrayHasKey( 'id', $response );
	}

	/**
	 * Test that all fields are returned when requested one by one.
	 */
	public function test_products_get_each_field_one_by_one_v2() {
		$expected_response_fields = $this->get_expected_response_fields();
		$product                  = \Automattic\PooCommerce\RestApi\UnitTests\Helpers\ProductHelper::create_simple_product();

		foreach ( $expected_response_fields as $field ) {
			$request = new WP_REST_Request( 'GET', '/wc/v2/products/' . $product->get_id() );
			$request->set_param( '_fields', $field );
			$response = $this->server->dispatch( $request );
			$this->assertEquals( 200, $response->get_status() );
			$response_fields = array_keys( $response->get_data() );

			$this->assertContains( $field, $response_fields, "Field $field was expected but not present in product API V2 response." );
		}
	}

	/**
	 * Test that the `include_meta` param filters the `meta_data` prop correctly.
	 */
	public function test_collection_param_include_meta() {
		$request = new WP_REST_Request( 'GET', '/wc/v2/products' );
		$request->set_param( 'include_meta', 'test1' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 4, $response_data );

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
		$request = new WP_REST_Request( 'GET', '/wc/v2/products' );
		$request->set_param( 'include_meta', '' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 4, $response_data );

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
		$request = new WP_REST_Request( 'GET', '/wc/v2/products' );
		$request->set_param( 'exclude_meta', 'test1' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 4, $response_data );

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
		$request = new WP_REST_Request( 'GET', '/wc/v2/products' );
		$request->set_param( 'include_meta', 'test1' );
		$request->set_param( 'exclude_meta', 'test1' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 4, $response_data );

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
		$request = new WP_REST_Request( 'GET', '/wc/v3/products' );
		$request->set_param( 'include_meta', 'test2' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$response_data       = $this->server->response_to_data( $response, false );
		$encoded_data_string = wp_json_encode( $response_data );
		$decoded_data_object = json_decode( $encoded_data_string, false ); // Ensure object instead of associative array.

		$this->assertIsArray( $decoded_data_object[0]->meta_data );
	}

	/**
	 * @testdox Test that an attribute with a multibyte name includes that name correctly in the attributes
	 *          property of the product object.
	 */
	public function test_product_with_multibyte_attribute() {
		$product   = WC_Helper_Product::create_simple_product();
		$attribute = WC_Helper_Product::create_product_attribute_object( 'Сирене', array( 'asdf', 'fdsa' ) );

		$product->set_attributes( array( $attribute ) );
		$product->save();

		$request  = new WP_REST_Request( 'GET', '/wc/v3/products/' . $product->get_id() );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();

		$this->assertEquals( 'Сирене', $data['attributes'][0]['name'] );
	}

	/**
	 * Data provider for test_search_by_sku_or_name.
	 *
	 * @return array[] Array of query string arguments and expected obtained SKUs pairs.
	 */
	public function data_provider_for_test_search_by_sku_or_name() {
		return array(
			// search_name_or_sku alone.

			array(
				array( 'search_name_or_sku' => 'shi blu' ),
				array( 'ebs', 'cbs', 'Elegant blue shirt', 'Casual blue shirt' ),
			),

			// search_name_or_sku supersedes search, search_sku and sku.

			array(
				array(
					'search_name_or_sku' => 'shi blu',
					'search'             => 'red',
				),
				array( 'ebs', 'cbs', 'Elegant blue shirt', 'Casual blue shirt' ),
			),
			array(
				array(
					'search_name_or_sku' => 'shi blu',
					'search_sku'         => 'the',
				),
				array( 'ebs', 'cbs', 'Elegant blue shirt', 'Casual blue shirt' ),
			),
			array(
				array(
					'search_name_or_sku' => 'shi blu',
					'sku'                => 'thesku1',
				),
				array( 'ebs', 'cbs', 'Elegant blue shirt', 'Casual blue shirt' ),
			),

			// search, search_sku and sku by themselves still work.

			array(
				array( 'search' => 'red' ),
				array( 'rs' ),
			),
			array(
				array( 'search_sku' => 'the' ),
				array( 'thesku1', 'thesku2' ),
			),
			array(
				array(
					'search_sku' => 'the',
					'sku'        => 'foo',
				),
				array( 'thesku1', 'thesku2' ),
			),
			array(
				array( 'sku' => 'thesku1' ),
				array( 'thesku1' ),
			),
		);
	}

	/**
	 * @testdox Tests for the search_by_sku_or_name query string argument.
	 *
	 * @dataProvider data_provider_for_test_search_by_sku_or_name
	 *
	 * @param array $query_string_args Query string arguments for the products query.
	 * @param array $expected_obtained_data Expected list of SKUs obtained.
	 */
	public function test_search_by_sku_or_name( array $query_string_args, array $expected_obtained_data ) {
		$skus_and_names = array(
			'ebs'                => 'Elegant blue shirt',
			'cbs'                => 'Casual blue shirt',
			'rs'                 => 'Red shirt',
			'bm'                 => 'Blue mug',
			'Elegant blue shirt' => 'Foobar 1',
			'Casual blue shirt'  => 'Foobar 2',
			'Red shirt'          => 'Foobar 3',
			'Blue mug'           => 'Foobar 4',
			'thesku1'            => 'Foobar 5',
			'thesku2'            => 'Foobar 6',
		);

		foreach ( $skus_and_names as $sku => $name ) {
			$product = WC_Helper_Product::create_simple_product();
			$product->set_name( $name );
			$product->set_sku( $sku );
			$product->save();
		}

		$query_string_args['_fields'] = 'sku';

		$request = new WP_REST_Request( 'GET', '/wc/v3/products' );
		$request->set_query_params( $query_string_args );

		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$actual_data = $response->get_data();
		$actual_data = ArrayUtil::select( $actual_data, 'sku' );

		$this->assertEqualsCanonicalizing( $expected_obtained_data, $actual_data );
	}
}
