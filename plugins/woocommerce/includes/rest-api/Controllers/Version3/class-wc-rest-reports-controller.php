<?php
/**
 * REST API Reports controller
 *
 * Handles requests to the reports endpoint.
 *
 * @package PooCommerce\RestApi
 * @since   2.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * REST API Reports controller class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Reports_V2_Controller
 */
class WC_REST_Reports_Controller extends WC_REST_Reports_V2_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v3';

	/**
	 * Get reports list.
	 *
	 * @since 3.5.0
	 * @return array
	 */
	protected function get_reports() {
		$reports = parent::get_reports();

		$reports[] = array(
			'slug'        => 'orders/totals',
			'description' => __( 'Orders totals.', 'poocommerce' ),
		);
		$reports[] = array(
			'slug'        => 'products/totals',
			'description' => __( 'Products totals.', 'poocommerce' ),
		);
		$reports[] = array(
			'slug'        => 'customers/totals',
			'description' => __( 'Customers totals.', 'poocommerce' ),
		);
		$reports[] = array(
			'slug'        => 'coupons/totals',
			'description' => __( 'Coupons totals.', 'poocommerce' ),
		);
		$reports[] = array(
			'slug'        => 'reviews/totals',
			'description' => __( 'Reviews totals.', 'poocommerce' ),
		);
		$reports[] = array(
			'slug'        => 'categories/totals',
			'description' => __( 'Categories totals.', 'poocommerce' ),
		);
		$reports[] = array(
			'slug'        => 'tags/totals',
			'description' => __( 'Tags totals.', 'poocommerce' ),
		);
		$reports[] = array(
			'slug'        => 'attributes/totals',
			'description' => __( 'Attributes totals.', 'poocommerce' ),
		);

		return $reports;
	}
}
