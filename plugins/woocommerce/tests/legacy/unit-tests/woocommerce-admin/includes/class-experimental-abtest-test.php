<?php
/**
 * Experimental_Abtest Tests
 *
 * @package PooCommerce\Admin
 */

use PooCommerce\Admin\Experimental_Abtest;


/**
 * Experimental_Abtest Tests
 *
 * @package PooCommerce\Admin
 */
class Experimental_Abtest_Test extends WC_Unit_Test_Case {

	/**
	 * Tests poocommerce_explat_request_args filter is used to construct
	 * the request URL.
	 */
	public function test_it_applies_filters_to_construct_request_args() {
		delete_transient( 'abtest_variation_control' );
		add_filter(
			'pre_http_request',
			function( $arg1, $arg2, $url ) {
				$this->assertTrue( false !== strpos( $url, 'test=test' ) );
				return array(
					'response'    => 200,
					'status_code' => 200,
					'success'     => 1,
					'body'        => '{}',
				);
			},
			10,
			3
		);

		add_filter(
			'poocommerce_explat_request_args',
			function( $args ) {
				$args['test'] = 'test';
				return $args;
			},
			10,
			1
		);

		$exp = new Experimental_Abtest( 'anon', 'platform', true );
		$exp->get_variation( 'control' );
	}

	/**
	 * Tests retrieve the default control variation when consent is false
	 */
	public function test_get_variation_return_control_when_no_consent() {
		$exp = new Experimental_Abtest( 'anon', 'platform', false );
		$this->assertEquals(
			$exp->get_variation( 'test_experiment_name' ),
			'control'
		);
	}

	/**
	 * Tests retrieve the treatment variation when consent is true and experiment name is valid
	 */
	public function test_get_variation() {
		delete_transient( 'abtest_variation_control' );
		add_filter(
			'pre_http_request',
			function( $preempt, $parsed_args, $url ) {
				return array(
					'response'    => 200,
					'status_code' => 200,
					'success'     => 1,
					'body'        => '{
						"variations": {
							"test_experiment_name": "treatment"
						}
					}',
				);
			},
			10,
			3
		);

		$exp = new Experimental_Abtest( 'anon', 'platform', true );
		$this->assertEquals(
			$exp->get_variation( 'test_experiment_name' ),
			'treatment'
		);
	}


	/**
	 * Tests return request_assignment wp error when anon_id is empty
	 */
	public function test_request_assignment_returns_wp_error_when_anon_id_is_empty() {
		$exp = new Experimental_Abtest( '', 'platform', true );

		$this->assertEquals(
			is_wp_error( $exp->request_assignment( 'test_experiment_name' ) ),
			true
		);
	}

	/**
	 * Test get_variation with invalid experiment name.
	 */
	public function test_fetch_variation_with_invalid_name() {
		$exp = new Experimental_Abtest( 'anon', 'platform', true );
		$this->expectException( 'Exception' );
		$this->expectExceptionMessage( 'Invalid A/B test name.' );
		$exp->get_variation( 'Invalid-Experiment-Name!' );
	}
}
