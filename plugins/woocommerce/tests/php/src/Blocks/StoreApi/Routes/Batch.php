<?php
/**
 * Controller Tests.
 */

namespace Automattic\PooCommerce\Tests\Blocks\StoreApi\Routes;

use Automattic\PooCommerce\Tests\Blocks\StoreApi\Routes\ControllerTestCase;
use Automattic\PooCommerce\Tests\Blocks\Helpers\FixtureData;

/**
 * Batch Controller Tests.
 */
class Batch extends ControllerTestCase {

	/**
	 * Setup test product data. Called before every test.
	 */
	protected function setUp(): void {
		add_filter(
			'__experimental_poocommerce_store_api_batch_request_methods',
			function ( $methods ) {
				$methods[] = 'GET';
				return $methods;
			}
		);
		parent::setUp();

		$fixtures = new FixtureData();

		$this->products = array(
			$fixtures->get_simple_product(
				array(
					'name'          => 'Test Product 1',
					'regular_price' => 10,
				)
			),
			$fixtures->get_simple_product(
				array(
					'name'          => 'Test Product 2',
					'regular_price' => 10,
				)
			),
		);
	}

	/**
	 * Test that a batch of requests are successful.
	 */
	public function test_success_cart_route_batch() {
		$request = new \WP_REST_Request( 'POST', '/wc/store/v1/batch' );
		$request->set_header( 'Nonce', wp_create_nonce( 'wc_store_api' ) );
		$request->set_body_params(
			array(
				'requests' => array(
					array(
						'method'  => 'POST',
						'path'    => '/wc/store/v1/cart/add-item',
						'body'    => array(
							'id'       => $this->products[0]->get_id(),
							'quantity' => 1,
						),
						'headers' => array(
							'Nonce' => wp_create_nonce( 'wc_store_api' ),
						),
					),
					array(
						'method'  => 'POST',
						'path'    => '/wc/store/v1/cart/add-item',
						'body'    => array(
							'id'       => $this->products[1]->get_id(),
							'quantity' => 1,
						),
						'headers' => array(
							'Nonce' => wp_create_nonce( 'wc_store_api' ),
						),
					),
				),
			)
		);
		$response      = rest_get_server()->dispatch( $request );
		$response_data = $response->get_data();

		// Assert that there were 2 successful results from the batch.
		$this->assertEquals( 2, count( $response_data['responses'] ) );
		$this->assertEquals( 201, $response_data['responses'][0]['status'] );
		$this->assertEquals( 201, $response_data['responses'][1]['status'] );
	}

	/**
	 * Test for a mixture of successful and non-successful requests in a batch.
	 */
	public function test_mix_cart_route_batch() {
		$request = new \WP_REST_Request( 'POST', '/wc/store/v1/batch' );
		$request->set_header( 'Nonce', wp_create_nonce( 'wc_store_api' ) );
		$request->set_body_params(
			array(
				'requests' => array(
					array(
						'method'  => 'POST',
						'path'    => '/wc/store/v1/cart/add-item',
						'body'    => array(
							'id'       => 99,
							'quantity' => 1,
						),
						'headers' => array(
							'Nonce' => wp_create_nonce( 'wc_store_api' ),
						),
					),
					array(
						'method'  => 'POST',
						'path'    => '/wc/store/v1/cart/add-item',
						'body'    => array(
							'id'       => $this->products[1]->get_id(),
							'quantity' => 1,
						),
						'headers' => array(
							'Nonce' => wp_create_nonce( 'wc_store_api' ),
						),
					),
				),
			)
		);
		$response      = rest_get_server()->dispatch( $request );
		$response_data = $response->get_data();

		$this->assertEquals( 2, count( $response_data['responses'] ) );
		$this->assertEquals( 400, $response_data['responses'][0]['status'], $response_data['responses'][0]['status'] );
		$this->assertEquals( 201, $response_data['responses'][1]['status'], $response_data['responses'][1]['status'] );
	}


	/**
	 * Do a batch request with a get request.
	 */
	public function test_batch_get_requests() {
		$request = new \WP_REST_Request( 'POST', '/wc/store/v1/batch' );
		$request->set_header( 'Nonce', wp_create_nonce( 'wc_store_api' ) );
		$request->set_body_params(
			array(
				'requests' => array(
					array(
						'method' => 'GET',
						'path'   => '/wc/store/v1/products',
					),
					array(
						'method' => 'GET',
						'path'   => '/wc/store/v1/products/collection-data',
					),
				),
			)
		);

		$response      = rest_get_server()->dispatch( $request );
		$response_data = $response->get_data();

		$this->assertEquals( 2, count( $response_data['responses'] ) );
		$this->assertEquals( 200, $response_data['responses'][0]['status'] );
	}
}
