<?php
/**
 * Cart session handling class.
 *
 * @package PooCommerce\Classes
 * @version 3.2.0
 */

use Automattic\PooCommerce\Enums\OrderStatus;
use Automattic\PooCommerce\Enums\ProductType;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_Cart_Session class.
 *
 * @since 3.2.0
 */
final class WC_Cart_Session {

	/**
	 * Reference to cart object.
	 *
	 * @since 3.2.0
	 * @var WC_Cart
	 */
	protected $cart;

	/**
	 * Sets up the items provided, and calculate totals.
	 *
	 * @since 3.2.0
	 * @throws Exception If missing WC_Cart object.
	 *
	 * @param WC_Cart $cart Cart object to calculate totals for.
	 */
	public function __construct( $cart ) {
		if ( ! is_a( $cart, 'WC_Cart' ) ) {
			throw new Exception( 'A valid WC_Cart object is required' );
		}

		$this->set_cart( $cart );
	}

	/**
	 * Sets the cart instance.
	 *
	 * @param WC_Cart $cart Cart object.
	 */
	public function set_cart( WC_Cart $cart ) {
		$this->cart = $cart;
	}


	/**
	 * Register methods for this object on the appropriate WordPress hooks.
	 */
	public function init() {
		/**
		 * Filters whether hooks should be initialized for the current cart session.
		 *
		 * @param bool $must_initialize Will be passed as true, meaning that the cart hooks should be initialized.
		 * @param bool $session The WC_Cart_Session object that is being initialized.
		 * @returns bool True if the cart hooks should be actually initialized, false if not.
		 *
		 * @since 6.9.0
		 */
		if ( ! apply_filters( 'poocommerce_cart_session_initialize', true, $this ) ) {
			return;
		}

		// Cart is loaded from session on wp_loaded. By this time the session is already initialized.
		add_action( 'wp_loaded', array( $this, 'get_cart_from_session' ) );

		// Destroy cart session when cart emptied.
		add_action( 'poocommerce_cart_emptied', array( $this, 'destroy_cart_session' ) );

		// Update session when the cart is updated.
		add_action( 'poocommerce_after_calculate_totals', array( $this, 'set_session' ), 1000 );
		add_action( 'poocommerce_removed_coupon', array( $this, 'set_session' ) );

		// Cookie events - cart cookies need to be set before headers are sent.
		add_action( 'poocommerce_add_to_cart', array( $this, 'maybe_set_cart_cookies' ) );
		add_action( 'wp', array( $this, 'maybe_set_cart_cookies' ), 99 );
		add_action( 'shutdown', array( $this, 'maybe_set_cart_cookies' ), 0 );
	}

	/**
	 * Get the cart data from the PHP session and store it in class variables.
	 *
	 * @since 3.2.0
	 */
	public function get_cart_from_session() {
		/**
		 * Fires when cart is loaded from session.
		 *
		 * @since 3.2.0
		 */
		do_action( 'poocommerce_load_cart_from_session' );

		$wc_session  = WC()->session;
		$cart        = (array) array_filter( $wc_session->get( 'cart', array() ) );
		$cart_totals = $wc_session->get( 'cart_totals', null );

		$this->cart->set_totals( $cart_totals );
		$this->cart->set_applied_coupons( $wc_session->get( 'applied_coupons', array() ) );
		$this->cart->set_coupon_discount_totals( $wc_session->get( 'coupon_discount_totals', array() ) );
		$this->cart->set_coupon_discount_tax_totals( $wc_session->get( 'coupon_discount_tax_totals', array() ) );
		$this->cart->set_removed_cart_contents( $wc_session->get( 'removed_cart_contents', array() ) );

		// Flag to indicate the stored cart should be updated. If cart totals are null, this will be true to calculate totals.
		$update_cart_session = is_null( $cart_totals );

		// Flag to indicate whether this is a re-order.
		$order_again = false;

		// Populate cart from order.
		if ( isset( $_GET['order_again'], $_GET['_wpnonce'] ) && is_user_logged_in() && wp_verify_nonce( wp_unslash( $_GET['_wpnonce'] ), 'poocommerce-order_again' ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$cart                = $this->populate_cart_from_order( absint( $_GET['order_again'] ), $cart );
			$order_again         = true;
			$update_cart_session = true;
		}

		// Prime caches to reduce future queries.
		if ( is_callable( '_prime_post_caches' ) ) {
			_prime_post_caches( wp_list_pluck( $cart, 'product_id' ) );
		}

		$cart_contents = array();

		foreach ( $cart as $key => $values ) {
			if ( ! is_customize_preview() && 'customize-preview' === $key ) {
				continue;
			}

			$product = wc_get_product( $values['variation_id'] ? $values['variation_id'] : $values['product_id'] );

			if ( empty( $product ) || ! $product->exists() || 0 >= $values['quantity'] ) {
				continue;
			}

			/**
			 * Allow 3rd parties to validate this item before it's added to cart and add their own notices.
			 *
			 * @since 3.6.0
			 *
			 * @param bool       $remove_cart_item_from_session If true, the item will not be added to the cart. Default: false.
			 * @param string     $key Cart item key.
			 * @param array      $values Cart item values e.g. quantity and product_id.
			 * @param WC_Product $product The product being added to the cart.
			 */
			if ( apply_filters( 'poocommerce_pre_remove_cart_item_from_session', false, $key, $values, $product ) ) {
				$update_cart_session = true;
				/**
				 * Fires when cart item is removed from the session.
				 *
				 * @since 3.6.0
				 *
				 * @param string     $key Cart item key.
				 * @param array      $values Cart item values e.g. quantity and product_id.
				 * @param WC_Product $product The product being added to the cart.
				 */
				do_action( 'poocommerce_remove_cart_item_from_session', $key, $values, $product );

				/**
				 * Allow 3rd parties to override this item's is_purchasable() result with cart item data.
				 *
				 * @param bool       $is_purchasable If false, the item will not be added to the cart. Default: product's is_purchasable() status.
				 * @param string     $key Cart item key.
				 * @param array      $values Cart item values e.g. quantity and product_id.
				 * @param WC_Product $product The product being added to the cart.
				 *
				 * @since 7.0.0
				 */
			} elseif ( ! apply_filters( 'poocommerce_cart_item_is_purchasable', $product->is_purchasable(), $key, $values, $product ) ) {
				$update_cart_session = true;
				/* translators: %s: product name */
				$message = sprintf( __( '%s has been removed from your cart because it can no longer be purchased. Please contact us if you need assistance.', 'poocommerce' ), $product->get_name() );
				/**
				 * Filter message about item removed from the cart.
				 *
				 * @since 3.8.0
				 * @param string     $message Message.
				 * @param WC_Product $product Product data.
				 */
				$message = apply_filters( 'poocommerce_cart_item_removed_message', $message, $product );
				wc_add_notice( $message, 'error' );

				/**
				 * Fires when cart item is removed from the session.
				 *
				 * @since 3.6.0
				 *
				 * @param string     $key Cart item key.
				 * @param array      $values Cart item values e.g. quantity and product_id.
				 */
				do_action( 'poocommerce_remove_cart_item_from_session', $key, $values );

			} elseif ( ! empty( $values['data_hash'] ) && ! hash_equals( $values['data_hash'], wc_get_cart_item_data_hash( $product ) ) ) { // phpcs:ignore PHPCompatibility.PHP.NewFunctions.hash_equalsFound
				$update_cart_session = true;
				/* translators: %1$s: product name. %2$s product permalink */
				$message = sprintf( __( '%1$s has been removed from your cart because it has since been modified. You can add it back to your cart <a href="%2$s">here</a>.', 'poocommerce' ), $product->get_name(), $product->get_permalink() );

				/**
				 * Filter message about item removed from the cart because it has since been modified.
				 *
				 * @since 3.8.0
				 * @param string     $message Message.
				 * @param WC_Product $product Product data.
				 */
				wc_add_notice( apply_filters( 'poocommerce_cart_item_removed_because_modified_message', $message, $product ), 'notice' );

				/**
				 * Fires when cart item is removed from the session.
				 *
				 * @since 3.6.0
				 *
				 * @param string     $key Cart item key.
				 * @param array      $values Cart item values e.g. quantity and product_id.
				 */
				do_action( 'poocommerce_remove_cart_item_from_session', $key, $values );
			} else {
				// Put session data into array. Run through filter so other plugins can load their own session data.
				$session_data = array_merge(
					$values,
					array(
						'data' => $product,
					)
				);

				/**
				 * Filter to modify or add session data to the cart contents.
				 *
				 * @since 3.2.0
				 *
				 * @param array  $session_data Data for an item in the cart.
				 * @param array  $values       Data for an item in the cart, without the product object.
				 * @param string $key          The cart item hash.
				 */
				$cart_contents[ $key ] = apply_filters( 'poocommerce_get_cart_item_from_session', $session_data, $values, $key );

				if ( ! isset( $cart_contents[ $key ]['data'] ) || ! $cart_contents[ $key ]['data'] instanceof WC_Product ) {
					// If the cart contents is missing the product object after filtering, something is wrong.
					wc_doing_it_wrong(
						__METHOD__,
						'When filtering cart items with poocommerce_get_cart_item_from_session, each item must have a data key containing a product object.',
						'9.8.0'
					);

					// Add the product back in.
					$cart_contents[ $key ]['data'] = $product;
				}

				// Add to cart right away so the product is visible in poocommerce_get_cart_item_from_session hook.
				$this->cart->set_cart_contents( $cart_contents );
			}
		}

		// If it's not empty, it's been already populated by the loop above.
		if ( ! empty( $cart_contents ) ) {
			/**
			 * Filter the cart contents.
			 *
			 * @since 3.2.0
			 *
			 * @param array $cart_contents The cart contents.
			 */
			$this->cart->set_cart_contents( apply_filters( 'poocommerce_cart_contents_changed', $cart_contents ) );
		}

		/**
		 * Fires when cart is loaded from session.
		 *
		 * @since 3.2.0
		 *
		 * @param WC_Cart $cart The cart object.
		 */
		do_action( 'poocommerce_cart_loaded_from_session', $this->cart );

		$cart_for_session = $this->get_cart_for_session();

		if ( empty( $cart_for_session ) ) {
			// If the cart is empty, clear the cart session directly.
			$this->destroy_cart_session();
		} elseif ( $update_cart_session ) {
			// If the cart is not empty, and the cart session needs to be updated, calculate totals. Session will update after this.
			$this->cart->calculate_totals();
		} else {
			// Otherwise, just set the session. This was previously hooked into `poocommerce_cart_loaded_from_session` but that resulted in multiple session updates.
			$this->set_session();
		}

		// If this is a re-order, redirect to the cart page to get rid of the `order_again` query string.
		if ( $order_again ) {
			wp_safe_redirect( wc_get_cart_url() );
			exit;
		}
	}

	/**
	 * Destroy cart session data.
	 *
	 * @since 3.2.0
	 */
	public function destroy_cart_session() {
		$wc_session = WC()->session;

		$wc_session->set( 'cart', null );
		$wc_session->set( 'cart_totals', null );
		$wc_session->set( 'applied_coupons', null );
		$wc_session->set( 'coupon_discount_totals', null );
		$wc_session->set( 'coupon_discount_tax_totals', null );
		$wc_session->set( 'removed_cart_contents', null );
		$wc_session->set( 'order_awaiting_payment', null );
	}

	/**
	 * Will set cart cookies if needed and when possible.
	 *
	 * Headers are only updated if headers have not yet been sent.
	 *
	 * @since 3.2.0
	 */
	public function maybe_set_cart_cookies() {
		if ( headers_sent() || ! did_action( 'wp_loaded' ) ) {
			return;
		}
		if ( ! $this->cart->is_empty() ) {
			$this->set_cart_cookies( true );
		} elseif ( isset( $_COOKIE['poocommerce_items_in_cart'] ) ) { // WPCS: input var ok.
			$this->set_cart_cookies( false );
		}
		$this->dedupe_cookies();
	}

	/**
	 * Remove duplicate cookies from the response.
	 */
	private function dedupe_cookies() {
		$all_cookies    = array_filter(
			headers_list(),
			function ( $header ) {
				return stripos( $header, 'Set-Cookie:' ) !== false;
			}
		);
		$final_cookies  = array();
		$update_cookies = false;
		foreach ( $all_cookies as $cookie ) {

			list(, $cookie_value)             = explode( ':', $cookie, 2 );
			list($cookie_name, $cookie_value) = explode( '=', trim( $cookie_value ), 2 );

			if ( stripos( $cookie_name, 'poocommerce_' ) !== false ) {
				$key = $this->find_cookie_by_name( $cookie_name, $final_cookies );
				if ( false !== $key ) {
					$update_cookies = true;
					unset( $final_cookies[ $key ] );
				}
			}
			$final_cookies[] = $cookie;
		}

		if ( $update_cookies ) {
			header_remove( 'Set-Cookie' );
			foreach ( $final_cookies as $cookie ) {
				// Using header here preserves previous cookie args.
				header( $cookie, false );
			}
		}
	}

	/**
	 * Find a cookie by name in an array of cookies.
	 *
	 * @param  string $cookie_name Name of the cookie to find.
	 * @param  array  $cookies     Array of cookies to search.
	 * @return mixed               Key of the cookie if found, false if not.
	 */
	private function find_cookie_by_name( $cookie_name, $cookies ) {
		foreach ( $cookies as $key => $cookie ) {
			if ( strpos( $cookie, $cookie_name ) !== false ) {
				return $key;
			}
		}
		return false;
	}

	/**
	 * Sets the php session data for the cart and coupons.
	 */
	public function set_session() {
		$wc_session = WC()->session;

		$cart                       = $this->get_cart_for_session();
		$applied_coupons            = $this->cart->get_applied_coupons();
		$coupon_discount_totals     = $this->cart->get_coupon_discount_totals();
		$coupon_discount_tax_totals = $this->cart->get_coupon_discount_tax_totals();
		$removed_cart_contents      = $this->cart->get_removed_cart_contents();

		/*
		 * We want to clear out any empty/default data from the session that have no value in being stored so the session
		 * can be forgotten if empty.
		 */
		$wc_session->set( 'cart_totals', empty( $cart ) ? null : $this->cart->get_totals() );
		$wc_session->set( 'cart', empty( $cart ) ? null : $cart );
		$wc_session->set( 'applied_coupons', empty( $applied_coupons ) ? null : $applied_coupons );
		$wc_session->set( 'coupon_discount_totals', empty( $coupon_discount_totals ) ? null : $coupon_discount_totals );
		$wc_session->set( 'coupon_discount_tax_totals', empty( $coupon_discount_tax_totals ) ? null : $coupon_discount_tax_totals );
		$wc_session->set( 'removed_cart_contents', empty( $removed_cart_contents ) ? null : $removed_cart_contents );

		/**
		 * Fires when cart is updated.
		 *
		 * @since 3.2.0
		 */
		do_action( 'poocommerce_cart_updated' );
	}

	/**
	 * Returns the contents of the cart in an array without the 'data' element.
	 *
	 * @return array contents of the cart
	 */
	public function get_cart_for_session() {
		$cart_session = array();

		foreach ( $this->cart->get_cart() as $key => $values ) {
			$cart_session[ $key ] = $values;
			unset( $cart_session[ $key ]['data'] ); // Unset product object.
		}

		return $cart_session;
	}

	/**
	 * Save the persistent cart when the cart is updated.
	 *
	 * @deprecated 11.0.0 Data persists in the session table for longer instead of syncing to meta.
	 */
	public function persistent_cart_update() {
		wc_deprecated_function( 'persistent_cart_update', '11.0.0', 'Data persists in the session table for longer instead of syncing to meta.' );
	}

	/**
	 * Delete the persistent cart permanently.
	 *
	 * @deprecated 11.0.0 Data persists in the session table for longer instead of syncing to meta.
	 */
	public function persistent_cart_destroy() {
		wc_deprecated_function( 'persistent_cart_destroy', '11.0.0', 'Data persists in the session table for longer instead of syncing to meta.' );
	}

	/**
	 * Set cart hash cookie and items in cart if not already set.
	 *
	 * @param bool $set Should cookies be set (true) or unset.
	 */
	private function set_cart_cookies( $set = true ) {
		if ( $set ) {
			$setcookies = array(
				'poocommerce_items_in_cart' => '1',
				'poocommerce_cart_hash'     => WC()->cart->get_cart_hash(),
			);
			foreach ( $setcookies as $name => $value ) {
				if ( ! isset( $_COOKIE[ $name ] ) || $_COOKIE[ $name ] !== $value ) {
					wc_setcookie( $name, $value );
					$_COOKIE[ $name ] = $value;
				}
			}
		} else {
			$unsetcookies = array(
				'poocommerce_items_in_cart',
				'poocommerce_cart_hash',
			);
			foreach ( $unsetcookies as $name ) {
				if ( isset( $_COOKIE[ $name ] ) ) {
					wc_setcookie( $name, 0, time() - HOUR_IN_SECONDS );
					unset( $_COOKIE[ $name ] );
				}
			}
		}

		do_action( 'poocommerce_set_cart_cookies', $set );
	}

	/**
	 * Get a cart from an order, if user has permission.
	 *
	 * @since  3.5.0
	 *
	 * @param int   $order_id Order ID to try to load.
	 * @param array $cart Current cart array.
	 *
	 * @return array
	 */
	private function populate_cart_from_order( $order_id, $cart ) {
		$order = wc_get_order( $order_id );

		/**
		 * Filter the valid order statuses for reordering.
		 *
		 * @since 3.6.0
		 *
		 * @param array $valid_statuses Array of valid order statuses.
		 */
		$valid_statuses = apply_filters( 'poocommerce_valid_order_statuses_for_order_again', array( OrderStatus::COMPLETED ) );
		if ( ! $order->get_id() || ! $order->has_status( $valid_statuses ) || ! current_user_can( 'order_again', $order->get_id() ) ) {
			return;
		}

		if ( apply_filters( 'poocommerce_empty_cart_when_order_again', true ) ) {
			$cart = array();
		}

		$inital_cart_size = count( $cart );
		$order_items      = $order->get_items();

		foreach ( $order_items as $item ) {
			$product_id     = (int) apply_filters( 'poocommerce_add_to_cart_product_id', $item->get_product_id() );
			$quantity       = $item->get_quantity();
			$variation_id   = (int) $item->get_variation_id();
			$variations     = array();
			$cart_item_data = apply_filters( 'poocommerce_order_again_cart_item_data', array(), $item, $order );
			$product        = $item->get_product();

			if ( ! $product ) {
				continue;
			}

			// Prevent reordering variable products if no selected variation.
			if ( ! $variation_id && $product->is_type( ProductType::VARIABLE ) ) {
				continue;
			}

			// Prevent reordering items specifically out of stock.
			if ( ! $product->is_in_stock() ) {
				continue;
			}

			foreach ( $item->get_meta_data() as $meta ) {
				if ( taxonomy_is_product_attribute( $meta->key ) || meta_is_product_attribute( $meta->key, $meta->value, $product_id ) ) {
					$variations[ $meta->key ] = $meta->value;
				}
			}

			if ( ! apply_filters( 'poocommerce_add_to_cart_validation', true, $product_id, $quantity, $variation_id, $variations, $cart_item_data ) ) {
				continue;
			}

			// Add to cart directly.
			$cart_id          = WC()->cart->generate_cart_id( $product_id, $variation_id, $variations, $cart_item_data );
			$product_data     = wc_get_product( $variation_id ? $variation_id : $product_id );
			$cart[ $cart_id ] = apply_filters(
				'poocommerce_add_order_again_cart_item',
				array_merge(
					$cart_item_data,
					array(
						'key'          => $cart_id,
						'product_id'   => $product_id,
						'variation_id' => $variation_id,
						'variation'    => $variations,
						'quantity'     => $quantity,
						'data'         => $product_data,
						'data_hash'    => wc_get_cart_item_data_hash( $product_data ),
					)
				),
				$cart_id
			);
		}

		do_action_ref_array( 'poocommerce_ordered_again', array( $order->get_id(), $order_items, &$cart ) );

		$num_items_in_cart           = count( $cart );
		$num_items_in_original_order = count( $order_items );
		$num_items_added             = $num_items_in_cart - $inital_cart_size;

		if ( $num_items_in_original_order > $num_items_added ) {
			wc_add_notice(
				sprintf(
					/* translators: %d item count */
					_n(
						'%d item from your previous order is currently unavailable and could not be added to your cart.',
						'%d items from your previous order are currently unavailable and could not be added to your cart.',
						$num_items_in_original_order - $num_items_added,
						'poocommerce'
					),
					$num_items_in_original_order - $num_items_added
				),
				'error'
			);
		}

		if ( 0 < $num_items_added ) {
			wc_add_notice( __( 'The cart has been filled with the items from your previous order.', 'poocommerce' ) );
		}

		return $cart;
	}
}
