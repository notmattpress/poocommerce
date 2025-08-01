<?php
declare( strict_types=1 );
namespace Automattic\PooCommerce\StoreApi\Routes\V1;

use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Blocks\Domain\Services\CheckoutFields;
use Automattic\PooCommerce\StoreApi\Exceptions\RouteException;
use Automattic\PooCommerce\StoreApi\SchemaController;
use Automattic\PooCommerce\StoreApi\Schemas\V1\AbstractSchema;
use Automattic\PooCommerce\StoreApi\Schemas\V1\CartItemSchema;
use Automattic\PooCommerce\StoreApi\Schemas\V1\CartSchema;
use Automattic\PooCommerce\StoreApi\SessionHandler;
use Automattic\PooCommerce\StoreApi\Utilities\CartController;
use Automattic\PooCommerce\StoreApi\Utilities\DraftOrderTrait;
use Automattic\PooCommerce\StoreApi\Utilities\OrderController;
use Automattic\PooCommerce\StoreApi\Utilities\CartTokenUtils;

/**
 * Abstract Cart Route
 */
abstract class AbstractCartRoute extends AbstractRoute {
	use DraftOrderTrait;

	/**
	 * The route's schema.
	 *
	 * @var string
	 */
	const SCHEMA_TYPE = 'cart';

	/**
	 * Schema class instance.
	 *
	 * @var CartSchema
	 */
	protected $schema;

	/**
	 * Schema class for the cart.
	 *
	 * @var CartSchema
	 */
	protected $cart_schema;

	/**
	 * Schema class for the cart item.
	 *
	 * @var CartItemSchema
	 */
	protected $cart_item_schema;

	/**
	 * Cart controller class instance.
	 *
	 * @var CartController
	 */
	protected $cart_controller;

	/**
	 * Order controller class instance.
	 *
	 * @var OrderController
	 */
	protected $order_controller;

	/**
	 * Additional fields controller class instance.
	 *
	 * @var CheckoutFields
	 */
	protected $additional_fields_controller;

	/**
	 * True when this route has been requested with a valid cart token.
	 *
	 * @var bool|null
	 */
	protected $has_cart_token = null;

	/**
	 * Constructor.
	 *
	 * @param SchemaController $schema_controller Schema Controller instance.
	 * @param AbstractSchema   $schema Schema class for this route.
	 */
	public function __construct( SchemaController $schema_controller, AbstractSchema $schema ) {
		parent::__construct( $schema_controller, $schema );

		$this->cart_schema                  = $this->schema_controller->get( CartSchema::IDENTIFIER );
		$this->cart_item_schema             = $this->schema_controller->get( CartItemSchema::IDENTIFIER );
		$this->cart_controller              = new CartController();
		$this->additional_fields_controller = Package::container()->get( CheckoutFields::class );
		$this->order_controller             = new OrderController();
	}

	/**
	 * Are we updating data or getting data?
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return boolean
	 */
	protected function is_update_request( \WP_REST_Request $request ) {
		return in_array( $request->get_method(), [ 'POST', 'PUT', 'PATCH', 'DELETE' ], true );
	}

	/**
	 * Get the route response based on the type of request.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_response( \WP_REST_Request $request ) {
		$this->load_cart_session( $request );

		$response    = null;
		$nonce_check = $this->requires_nonce( $request ) ? $this->check_nonce( $request ) : null;

		if ( is_wp_error( $nonce_check ) ) {
			$response = $nonce_check;
		}

		if ( ! $response ) {
			try {
				$response = $this->get_response_by_request_method( $request );
			} catch ( RouteException $error ) {
				$response = $this->get_route_error_response( $error->getErrorCode(), $error->getMessage(), $error->getCode(), $error->getAdditionalData() );
			} catch ( \Exception $error ) {
				$response = $this->get_route_error_response( 'poocommerce_rest_unknown_server_error', $error->getMessage(), 500 );
			}
		}

		// For update requests, this will recalculate cart totals and sync draft orders with the current cart.
		if ( $this->is_update_request( $request ) ) {
			$this->cart_updated( $request );
		}

		// Format error responses.
		if ( is_wp_error( $response ) ) {
			$response = $this->error_to_response( $response );
		}

		return $this->add_response_headers( rest_ensure_response( $response ) );
	}

	/**
	 * Add nonce headers to a response object.
	 *
	 * @param \WP_REST_Response $response The response object.
	 *
	 * @return \WP_REST_Response
	 */
	protected function add_response_headers( \WP_REST_Response $response ) {
		$nonce = wp_create_nonce( 'wc_store_api' );

		$response->header( 'Nonce', $nonce );
		$response->header( 'Nonce-Timestamp', time() );
		$response->header( 'User-ID', get_current_user_id() );
		$response->header( 'Cart-Token', $this->get_cart_token() );
		$response->header( 'Cart-Hash', WC()->cart->get_cart_hash() );

		return $response;
	}

	/**
	 * Load the cart session before handling responses.
	 *
	 * @param \WP_REST_Request $request Request object.
	 */
	protected function load_cart_session( \WP_REST_Request $request ) {
		if ( $this->has_cart_token( $request ) ) {
			// Overrides the core session class.
			add_filter(
				'poocommerce_session_handler',
				function () {
					return SessionHandler::class;
				}
			);
		}
		$this->cart_controller->load_cart();
		$this->cart_controller->normalize_cart();
	}

	/**
	 * Generates a cart token for the response headers.
	 *
	 * Current namespace is used as the token Issuer.
	 * *
	 *
	 * @return string
	 */
	protected function get_cart_token() {
		// Ensure cart is loaded.
		$this->cart_controller->load_cart();

		if ( ! wc()->session ) {
			return null;
		}

		return CartTokenUtils::get_cart_token( (string) wc()->session->get_customer_id() );
	}

	/**
	 * Checks if the request has a valid cart token.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool
	 */
	protected function has_cart_token( \WP_REST_Request $request ) {
		if ( is_null( $this->has_cart_token ) ) {
			$this->has_cart_token = CartTokenUtils::validate_cart_token( $request->get_header( 'Cart-Token' ) ?? '' );
		}
		return $this->has_cart_token;
	}

	/**
	 * Checks if a nonce is required for the route.
	 *
	 * @param \WP_REST_Request $request Request.
	 *
	 * @return bool
	 */
	protected function requires_nonce( \WP_REST_Request $request ) {
		return $this->is_update_request( $request ) && ! $this->has_cart_token( $request );
	}

	/**
	 * Triggered after an update to cart data. Re-calculates totals and updates draft orders (if they already exist) to
	 * keep all data in sync.
	 *
	 * @param \WP_REST_Request $request Request object.
	 */
	protected function cart_updated( \WP_REST_Request $request ) {
		$draft_order = $this->get_draft_order();

		if ( $draft_order ) {
			// This does not trigger a recalculation of the cart--endpoints should have already done so before returning
			// the cart response.
			$this->order_controller->update_order_from_cart( $draft_order, false );

			wc_do_deprecated_action(
				'poocommerce_blocks_cart_update_order_from_request',
				array(
					$draft_order,
					$request,
				),
				'7.2.0',
				'poocommerce_store_api_cart_update_order_from_request',
				'This action was deprecated in PooCommerce Blocks version 7.2.0. Please use poocommerce_store_api_cart_update_order_from_request instead.'
			);

			/**
			 * Fires when the order is synced with cart data from a cart route.
			 *
			 * @since 7.2.0
			 *
			 * @param \WC_Order $draft_order Order object.
			 * @param \WC_Customer $customer Customer object.
			 * @param \WP_REST_Request $request Full details about the request.
			 */
			do_action( 'poocommerce_store_api_cart_update_order_from_request', $draft_order, $request );
		}
	}

	/**
	 * For non-GET endpoints, require and validate a nonce to prevent CSRF attacks.
	 *
	 * Nonces will mismatch if the logged in session cookie is different! If using a client to test, set this cookie
	 * to match the logged in cookie in your browser.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return \WP_Error|boolean
	 */
	protected function check_nonce( \WP_REST_Request $request ) {
		$nonce = null;

		if ( $request->get_header( 'Nonce' ) ) {
			$nonce = $request->get_header( 'Nonce' );
		}

		/**
		 * Filters the Store API nonce check.
		 *
		 * This can be used to disable the nonce check when testing API endpoints via a REST API client.
		 *
		 * @since 4.5.0
		 *
		 * @param boolean $disable_nonce_check If true, nonce checks will be disabled.
		 *
		 * @return boolean
		 */
		if ( apply_filters( 'poocommerce_store_api_disable_nonce_check', false ) ) {
			return true;
		}

		if ( null === $nonce ) {
			return $this->get_route_error_response( 'poocommerce_rest_missing_nonce', __( 'Missing the Nonce header. This endpoint requires a valid nonce.', 'poocommerce' ), 401 );
		}

		if ( ! wp_verify_nonce( $nonce, 'wc_store_api' ) ) {
			return $this->get_route_error_response( 'poocommerce_rest_invalid_nonce', __( 'Nonce is invalid.', 'poocommerce' ), 403 );
		}

		return true;
	}

	/**
	 * Get route response when something went wrong.
	 *
	 * @param string $error_code String based error code.
	 * @param string $error_message User facing error message.
	 * @param int    $http_status_code HTTP status. Defaults to 500.
	 * @param array  $additional_data Extra data (key value pairs) to expose in the error response.
	 *
	 * @return \WP_Error WP Error object.
	 */
	protected function get_route_error_response( $error_code, $error_message, $http_status_code = 500, $additional_data = [] ) {
		$additional_data['status'] = $http_status_code;

		// If there was a conflict, return the cart so the client can resolve it.
		if ( 409 === $http_status_code ) {
			$additional_data['cart'] = $this->cart_schema->get_item_response( $this->cart_controller->get_cart_for_response() );
		}

		return new \WP_Error( $error_code, $error_message, $additional_data );
	}
}
