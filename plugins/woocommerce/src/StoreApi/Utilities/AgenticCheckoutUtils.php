<?php
declare(strict_types=1);
namespace Automattic\PooCommerce\StoreApi\Utilities;

use Automattic\PooCommerce\StoreApi\Exceptions\RouteException;
use Automattic\PooCommerce\Internal\Agentic\Enums\Specs\CheckoutSessionStatus;
use Automattic\PooCommerce\Internal\Agentic\Enums\Specs\ErrorCode;
use Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\Enums\SessionKey;
use Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\Errors\Error;
use Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\Error as AgenticError;
use Automattic\PooCommerce\Internal\Features\FeaturesController;
use Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\AgenticCheckoutSession;
use Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\Messages\MessageError;
use Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\Messages\Messages;

/**
 * AgenticCheckoutUtils class.
 *
 * Utility class for shared Agentic Checkout API functionality.
 */
class AgenticCheckoutUtils {

	/**
	 * Get the shared parameters schema for checkout session requests.
	 *
	 * @return array Parameters array.
	 */
	public static function get_shared_params() {
		return [
			'items'               => [
				'description' => __( 'Line items to add to the cart.', 'poocommerce' ),
				'type'        => 'array',
				'items'       => [
					'type'       => 'object',
					'properties' => [
						'id'       => [
							'description' => __( 'Product ID.', 'poocommerce' ),
							'type'        => 'string',
						],
						'quantity' => [
							'description' => __( 'Quantity.', 'poocommerce' ),
							'type'        => 'integer',
							'minimum'     => 1,
						],
					],
					'required'   => [ 'id', 'quantity' ],
				],
			],
			'buyer'               => [
				'description' => __( 'Buyer information.', 'poocommerce' ),
				'type'        => 'object',
				'properties'  => [
					'first_name'   => [
						'description' => __( 'First name.', 'poocommerce' ),
						'type'        => 'string',
					],
					'last_name'    => [
						'description' => __( 'Last name.', 'poocommerce' ),
						'type'        => 'string',
					],
					'email'        => [
						'description' => __( 'Email address.', 'poocommerce' ),
						'type'        => 'string',
						'format'      => 'email',
					],
					'phone_number' => [
						'description' => __( 'Phone number.', 'poocommerce' ),
						'type'        => 'string',
					],
				],
			],
			'fulfillment_address' => [
				'description' => __( 'Fulfillment/shipping address.', 'poocommerce' ),
				'type'        => 'object',
				'properties'  => [
					'name'        => [
						'description' => __( 'Full name.', 'poocommerce' ),
						'type'        => 'string',
					],
					'line_one'    => [
						'description' => __( 'Address line 1.', 'poocommerce' ),
						'type'        => 'string',
					],
					'line_two'    => [
						'description' => __( 'Address line 2.', 'poocommerce' ),
						'type'        => 'string',
					],
					'city'        => [
						'description' => __( 'City.', 'poocommerce' ),
						'type'        => 'string',
					],
					'state'       => [
						'description' => __( 'State/province.', 'poocommerce' ),
						'type'        => 'string',
					],
					'country'     => [
						'description' => __( 'Country code (ISO 3166-1 alpha-2).', 'poocommerce' ),
						'type'        => 'string',
					],
					'postal_code' => [
						'description' => __( 'Postal/ZIP code.', 'poocommerce' ),
						'type'        => 'string',
					],
				],
				'required'    => [ 'line_one', 'city', 'country', 'postal_code' ],
			],
		];
	}

	/**
	 * Add items to cart from request.
	 *
	 * @param array          $items Items array from request.
	 * @param CartController $cart_controller Cart controller instance.
	 * @param Messages       $messages Error messages instance.
	 * @return Error|null Returns error response on failure, null on success.
	 */
	public static function add_items_to_cart( $items, $cart_controller, $messages ) {
		foreach ( $items as $item_index => $item ) {
			if ( ! ctype_digit( $item['id'] ) ) {
				return AgenticError::invalid_request(
					'invalid_product_id',
					__( 'Product ID must be numeric.', 'poocommerce' ),
					'$.items[' . $item_index . '].id'
				);
			}

			$product_id = (int) $item['id'];
			$quantity   = (int) $item['quantity'];

			try {
				$cart_controller->add_to_cart(
					[
						'id'       => $product_id,
						'quantity' => $quantity,
					]
				);
			} catch ( RouteException $exception ) {
				$message       = wp_specialchars_decode( $exception->getMessage(), ENT_QUOTES );
				$param         = '$.items[' . $item_index . ']';
				$message_error = null;

				// Map PooCommerce error codes to Agentic Commerce Protocol error codes.
				switch ( $exception->getErrorCode() ) {
					case 'poocommerce_rest_product_out_of_stock':
					case 'poocommerce_rest_product_partially_out_of_stock':
						$message_error = MessageError::out_of_stock( $message, $param );
						break;
				}

				if ( null !== $message_error ) {
					$messages->add( $message_error );
				} else {
					// The error code is generally applicable only to MessageErrors, but we can use it here as well.
					return AgenticError::invalid_request( ErrorCode::INVALID, $message, $param );
				}
			}
		}

		return null;
	}

	/**
	 * Set buyer data on customer.
	 *
	 * @param array        $buyer Buyer data.
	 * @param \WC_Customer $customer Customer instance.
	 */
	public static function set_buyer_data( $buyer, $customer ) {
		if ( isset( $buyer['first_name'] ) ) {
			$first_name = wc_clean( wp_unslash( $buyer['first_name'] ) );
			$customer->set_billing_first_name( $first_name );
			$customer->set_shipping_first_name( $first_name );
		}

		if ( isset( $buyer['last_name'] ) ) {
			$last_name = wc_clean( wp_unslash( $buyer['last_name'] ) );
			$customer->set_billing_last_name( $last_name );
			$customer->set_shipping_last_name( $last_name );
		}

		if ( isset( $buyer['email'] ) ) {
			$email = sanitize_email( wp_unslash( $buyer['email'] ) );
			if ( is_email( $email ) ) {
				$customer->set_billing_email( $email );
			}
		}

		if ( isset( $buyer['phone_number'] ) ) {
			$phone = wc_clean( wp_unslash( $buyer['phone_number'] ) );
			$customer->set_billing_phone( $phone );
		}

		$customer->save();
	}

	/**
	 * Set fulfillment address on customer.
	 *
	 * @param array        $address Address data.
	 * @param \WC_Customer $customer Customer instance.
	 */
	public static function set_fulfillment_address( $address, $customer ) {
		// Only parse and set name if provided and non-empty.
		if ( ! empty( $address['name'] ) ) {
			$name       = wc_clean( wp_unslash( $address['name'] ) );
			$name_parts = explode( ' ', $name, 2 );
			$first_name = $name_parts[0];
			$last_name  = isset( $name_parts[1] ) ? $name_parts[1] : '';

			// Set shipping names.
			$customer->set_shipping_first_name( $first_name );
			$customer->set_shipping_last_name( $last_name );
		} else {
			// Preserve existing shipping names.
			$first_name = $customer->get_shipping_first_name();
			$last_name  = $customer->get_shipping_last_name();
		}

		// Sanitize all address fields.
		$line_one    = wc_clean( wp_unslash( $address['line_one'] ?? '' ) );
		$line_two    = wc_clean( wp_unslash( $address['line_two'] ?? '' ) );
		$city        = wc_clean( wp_unslash( $address['city'] ?? '' ) );
		$state       = wc_clean( wp_unslash( $address['state'] ?? '' ) );
		$postal_code = wc_clean( wp_unslash( $address['postal_code'] ?? '' ) );
		$country     = wc_clean( wp_unslash( $address['country'] ?? '' ) );

		// Set shipping address fields.
		$customer->set_shipping_address_1( $line_one );
		$customer->set_shipping_address_2( $line_two );
		$customer->set_shipping_city( $city );
		$customer->set_shipping_state( $state );
		$customer->set_shipping_postcode( $postal_code );
		$customer->set_shipping_country( $country );

		// Also set as billing address if not already set.
		if ( ! $customer->get_billing_address_1() ) {
			// For billing, only set names if provided or use existing billing names.
			if ( ! empty( $address['name'] ) ) {
				$customer->set_billing_first_name( $first_name );
				$customer->set_billing_last_name( $last_name );
			}
			$customer->set_billing_address_1( $line_one );
			$customer->set_billing_address_2( $line_two );
			$customer->set_billing_city( $city );
			$customer->set_billing_state( $state );
			$customer->set_billing_postcode( $postal_code );
			$customer->set_billing_country( $country );
		}

		$customer->save();
	}

	/**
	 * Clear fulfillment address from customer.
	 *
	 * @param \WC_Customer $customer Customer instance.
	 */
	public static function clear_fulfillment_address( $customer ) {
		// Clear shipping address.
		$customer->set_shipping_first_name( '' );
		$customer->set_shipping_last_name( '' );
		$customer->set_shipping_address_1( '' );
		$customer->set_shipping_address_2( '' );
		$customer->set_shipping_city( '' );
		$customer->set_shipping_state( '' );
		$customer->set_shipping_postcode( '' );
		$customer->set_shipping_country( '' );

		$customer->save();
	}

	/**
	 * Set billing address on customer.
	 *
	 * @param array        $address Address data.
	 * @param \WC_Customer $customer Customer instance.
	 */
	public static function set_billing_address( $address, $customer ) {
		// Only parse and set name if provided and non-empty.
		if ( ! empty( $address['name'] ) ) {
			$name       = wc_clean( wp_unslash( $address['name'] ) );
			$name_parts = explode( ' ', $name, 2 );
			$first_name = $name_parts[0];
			$last_name  = isset( $name_parts[1] ) ? $name_parts[1] : '';

			// Set billing names.
			$customer->set_billing_first_name( $first_name );
			$customer->set_billing_last_name( $last_name );
		}

		// Sanitize all address fields.
		$line_one    = wc_clean( wp_unslash( $address['line_one'] ?? '' ) );
		$line_two    = wc_clean( wp_unslash( $address['line_two'] ?? '' ) );
		$city        = wc_clean( wp_unslash( $address['city'] ?? '' ) );
		$state       = wc_clean( wp_unslash( $address['state'] ?? '' ) );
		$postal_code = wc_clean( wp_unslash( $address['postal_code'] ?? '' ) );
		$country     = wc_clean( wp_unslash( $address['country'] ?? '' ) );

		// Set billing address fields.
		$customer->set_billing_address_1( $line_one );
		$customer->set_billing_address_2( $line_two );
		$customer->set_billing_city( $city );
		$customer->set_billing_state( $state );
		$customer->set_billing_postcode( $postal_code );
		$customer->set_billing_country( $country );

		$customer->save();
	}

	/**
	 * Add Agentic Commerce Protocol headers to response.
	 *
	 * @param \WP_REST_Response $response Response object.
	 * @param \WP_REST_Request  $request Request object.
	 * @return \WP_REST_Response Response with headers.
	 */
	public static function add_protocol_headers( \WP_REST_Response $response, \WP_REST_Request $request ) {
		// Echo Idempotency-Key header if provided.
		$idempotency_key = $request->get_header( 'Idempotency-Key' );
		if ( $idempotency_key ) {
			$response->header( 'Idempotency-Key', $idempotency_key );
		}

		// Echo Request-Id header if provided.
		$request_id = $request->get_header( 'Request-Id' );
		if ( $request_id ) {
			$response->header( 'Request-Id', $request_id );
		}

		return $response;
	}

	/**
	 * Check if the Agentic Checkout feature is enabled.
	 *
	 * V1 implementation: Returns true if feature is enabled (no auth check).
	 * Future: Implement Bearer token authentication.
	 *
	 * @return bool|\WP_Error True if authorized, WP_Error otherwise.
	 */
	public static function is_authorized() {
		// Check if feature is enabled.
		$features_controller = wc_get_container()->get( FeaturesController::class );
		if ( ! $features_controller->feature_is_enabled( 'agentic_checkout' ) ) {
			return new \WP_Error(
				'poocommerce_rest_agentic_checkout_disabled',
				__( 'Agentic Checkout API is not enabled.', 'poocommerce' ),
				array( 'status' => 403 )
			);
		}

		// V1: Allow all requests (implement proper auth in future).
		return true;
	}

	/**
	 * Validates a session.
	 *
	 * @param AgenticCheckoutSession $checkout_session Checkout session object.
	 * @return void
	 */
	public static function validate( AgenticCheckoutSession $checkout_session ): void {
		$messages = $checkout_session->get_messages();

		// Check if ready for payment.
		$needs_shipping = $checkout_session->get_cart()->needs_shipping();
		$has_address    = WC()->customer && WC()->customer->get_shipping_address_1();

		// Add info message if shipping is needed.
		if ( $needs_shipping && ! $has_address ) {
			$messages->add(
				MessageError::missing(
					__( 'Shipping address required.', 'poocommerce' ),
					'$.fulfillment_address'
				)
			);
		}

		// Check if valid shipping method is selected (not just empty strings).
		$chosen_methods = WC()->session ? WC()->session->get( SessionKey::CHOSEN_SHIPPING_METHODS ) : null;
		$has_shipping   = ! empty( $chosen_methods ) && ! empty( array_filter( $chosen_methods ) );

		if ( $needs_shipping && ! $has_shipping ) {
			$messages->add(
				MessageError::missing(
					__( 'No shipping method selected.', 'poocommerce' ),
					'$.fulfillment_option_id'
				)
			);
		}
	}

	/**
	 * Calculate the status of the checkout session.
	 *
	 * @param AgenticCheckoutSession $checkout_session Checkout session object.
	 *
	 * @return string Status value.
	 */
	public static function calculate_status( AgenticCheckoutSession $checkout_session ): string {
		$wc_session = WC()->session;
		if ( null === $wc_session ) {
			return CheckoutSessionStatus::CANCELED;
		}

		if ( $wc_session->get( SessionKey::AGENTIC_CHECKOUT_COMPLETED_ORDER_ID ) ) {
			return CheckoutSessionStatus::COMPLETED;
		}

		if ( $wc_session->get( SessionKey::AGENTIC_CHECKOUT_PAYMENT_IN_PROGRESS ) ) {
			return CheckoutSessionStatus::IN_PROGRESS;
		}

		// Check for validation errors.
		if (
			$checkout_session->get_messages()->has_errors()
			// Once we switch to using the CartController everywhere, there should be no notices and need for this.
			|| ! empty( wc_get_notices( 'error' ) )
		) {
			return CheckoutSessionStatus::NOT_READY_FOR_PAYMENT;
		}

		return CheckoutSessionStatus::READY_FOR_PAYMENT;
	}

	/**
	 * Get the agentic commerce payment gateway from available gateways.
	 *
	 * Finds the first gateway that supports agentic commerce and has the required methods.
	 *
	 * @param array $available_gateways Array of available payment gateways.
	 * @return \WC_Payment_Gateway|null The agentic commerce gateway or null if not found.
	 */
	public static function get_agentic_commerce_gateway( $available_gateways ) {
		if ( empty( $available_gateways ) ) {
			return null;
		}

		foreach ( $available_gateways as $gateway ) {
			if ( $gateway->supports( \Automattic\PooCommerce\Enums\PaymentGatewayFeature::AGENTIC_COMMERCE )
				&& method_exists( $gateway, 'get_agentic_commerce_provider' )
				&& method_exists( $gateway, 'get_agentic_commerce_payment_methods' )
			) {
				return $gateway;
			}
		}

		return null;
	}

	/**
	 * Whether the current request is within Agentic Commerce session.
	 *
	 * @return bool
	 */
	public static function is_agentic_commerce_session(): bool {
		$wc_session = WC()->session;
		if ( null === $wc_session ) {
			return false;
		}

		return ! empty( $wc_session->get( SessionKey::AGENTIC_CHECKOUT_SESSION_ID ) );
	}
}
