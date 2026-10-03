<?php
/**
 * REST API Brands controller for WC 3.5+
 *
 * Handles requests to /products/brands endpoint.
 *
 * Important: For internal use only by the Automattic\PooCommerce\Internal\Brands package.
 *
 * @package PooCommerce\RestApi
 * @since   9.4.0
 */

declare( strict_types = 1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API Brands controller class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Product_Categories_Controller
 */
class WC_REST_Product_Brands_V2_Controller extends WC_REST_Product_Categories_V2_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'products/brands';

	/**
	 * Taxonomy.
	 *
	 * @var string
	 */
	protected $taxonomy = 'product_brand';
}
