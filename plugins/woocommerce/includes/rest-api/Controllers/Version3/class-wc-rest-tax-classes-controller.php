<?php
/**
 * REST API Tax Classes controller
 *
 * Handles requests to the /taxes/classes endpoint.
 *
 * @package PooCommerce\RestApi
 * @since   2.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * REST API Tax Classes controller class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Tax_Classes_V2_Controller
 */
class WC_REST_Tax_Classes_Controller extends WC_REST_Tax_Classes_V2_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v3';
}
