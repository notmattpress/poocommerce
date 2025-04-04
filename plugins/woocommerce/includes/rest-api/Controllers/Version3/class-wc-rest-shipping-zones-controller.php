<?php
/**
 * REST API Shipping Zones controller
 *
 * Handles requests to the /shipping/zones endpoint.
 *
 * @package PooCommerce\RestApi
 * @since   3.0.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * REST API Shipping Zones class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Shipping_Zones_V2_Controller
 */
class WC_REST_Shipping_Zones_Controller extends WC_REST_Shipping_Zones_V2_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v3';
}
