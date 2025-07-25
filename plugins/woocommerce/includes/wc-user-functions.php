<?php
/**
 * PooCommerce Customer Functions
 *
 * Functions for customers.
 *
 * @package PooCommerce\Functions
 * @version 2.2.0
 */

use Automattic\PooCommerce\Enums\OrderInternalStatus;
use Automattic\PooCommerce\Internal\DataStores\Orders\OrdersTableDataStore;
use Automattic\PooCommerce\Internal\Utilities\Users;
use Automattic\PooCommerce\Utilities\OrderUtil;

defined( 'ABSPATH' ) || exit;

/**
 * Prevent any user who cannot 'edit_posts' (subscribers, customers etc) from seeing the admin bar.
 *
 * Note: get_option( 'poocommerce_lock_down_admin', true ) is a deprecated option here for backwards compatibility. Defaults to true.
 *
 * @param bool $show_admin_bar If should display admin bar.
 * @return bool
 */
function wc_disable_admin_bar( $show_admin_bar ) {
	/**
	 * Controls whether the PooCommerce admin bar should be disabled.
	 *
	 * @since 3.0.0
	 *
	 * @param bool $enabled
	 */
	if ( apply_filters( 'poocommerce_disable_admin_bar', true ) && ! ( current_user_can( 'edit_posts' ) || current_user_can( 'manage_poocommerce' ) ) ) {
		$show_admin_bar = false;
	}

	return $show_admin_bar;
}
add_filter( 'show_admin_bar', 'wc_disable_admin_bar', 10, 1 ); // phpcs:ignore WordPress.VIP.AdminBarRemoval.RemovalDetected

if ( ! function_exists( 'wc_create_new_customer' ) ) {

	/**
	 * Create a new customer.
	 *
	 * @since 9.4.0 Moved poocommerce_registration_error_email_exists filter to the shortcode checkout class.
	 * @since 9.4.0 Removed handling for generating username/password based on settings--this is consumed at form level. Here, if data is missing it will be generated.
	 *
	 * @param  string $email    Customer email.
	 * @param  string $username Customer username.
	 * @param  string $password Customer password.
	 * @param  array  $args     List of arguments to pass to `wp_insert_user()`.
	 * @return int|WP_Error Returns WP_Error on failure, Int (user ID) on success.
	 */
	function wc_create_new_customer( $email, $username = '', $password = '', $args = array() ) {
		if ( empty( $email ) || ! is_email( $email ) ) {
			return new WP_Error( 'registration-error-invalid-email', __( 'Please provide a valid email address.', 'poocommerce' ) );
		}

		if ( email_exists( $email ) ) {
			return new WP_Error(
				'registration-error-email-exists',
				sprintf(
					// Translators: %s Email address.
					esc_html__( 'An account is already registered with %s. Please log in or use a different email address.', 'poocommerce' ),
					esc_html( $email )
				)
			);
		}

		if ( empty( $username ) ) {
			$username = wc_create_new_customer_username( $email, $args );
		}

		$username = sanitize_user( $username );

		if ( empty( $username ) || ! validate_username( $username ) ) {
			return new WP_Error( 'registration-error-invalid-username', __( 'Please provide a valid account username.', 'poocommerce' ) );
		}

		if ( username_exists( $username ) ) {
			return new WP_Error( 'registration-error-username-exists', __( 'An account is already registered with that username. Please choose another.', 'poocommerce' ) );
		}

		// Handle password creation.
		$password_generated = false;

		if ( empty( $password ) ) {
			$password           = wp_generate_password();
			$password_generated = true;
		}

		if ( empty( $password ) ) {
			return new WP_Error( 'registration-error-missing-password', __( 'Please create a password for your account.', 'poocommerce' ) );
		}

		// Use WP_Error to handle registration errors.
		$errors = new WP_Error();

		/**
		 * Fires before a customer account is registered.
		 *
		 * This hook fires before customer accounts are created and passes the form data (username, email) and an array
		 * of errors.
		 *
		 * This could be used to add extra validation logic and append errors to the array.
		 *
		 * @since 7.2.0
		 *
		 * @internal Matches filter name in PooCommerce core.
		 *
		 * @param string $username Customer username.
		 * @param string $user_email Customer email address.
		 * @param \WP_Error $errors Error object.
		 */
		do_action( 'poocommerce_register_post', $username, $email, $errors );

		/**
		 * Filters registration errors before a customer account is registered.
		 *
		 * This hook filters registration errors. This can be used to manipulate the array of errors before
		 * they are displayed.
		 *
		 * @since 7.2.0
		 *
		 * @internal Matches filter name in PooCommerce core.
		 *
		 * @param \WP_Error $errors Error object.
		 * @param string $username Customer username.
		 * @param string $user_email Customer email address.
		 * @return \WP_Error
		 */
		$errors = apply_filters( 'poocommerce_registration_errors', $errors, $username, $email );

		if ( is_wp_error( $errors ) && $errors->get_error_code() ) {
			return $errors;
		}

		// Merged passed args with sanitized username, email, and password.
		$customer_data = array_merge(
			$args,
			array(
				'user_login' => $username,
				'user_pass'  => $password,
				'user_email' => $email,
				'role'       => 'customer',
			)
		);

		/**
		 * Filters customer data before a customer account is registered.
		 *
		 * This hook filters customer data. It allows user data to be changed, for example, username, password, email,
		 * first name, last name, and role.
		 *
		 * @since 7.2.0
		 *
		 * @param array $customer_data An array of customer (user) data.
		 * @return array
		 */
		$new_customer_data = apply_filters(
			'poocommerce_new_customer_data',
			wp_parse_args(
				$customer_data,
				array(
					'first_name' => '',
					'last_name'  => '',
					'source'     => 'unknown',
				)
			)
		);

		$customer_id = wp_insert_user( $new_customer_data );

		if ( is_wp_error( $customer_id ) ) {
			return $customer_id;
		}

		// Set account flag to remind customer to update generated password.
		if ( $password_generated ) {
			update_user_option( $customer_id, 'default_password_nag', true, true );
		}

		/**
		 * Fires after a customer account has been registered.
		 *
		 * This hook fires after customer accounts are created and passes the customer data.
		 *
		 * @since 7.2.0
		 *
		 * @internal Matches filter name in PooCommerce core.
		 *
		 * @param integer $customer_id New customer (user) ID.
		 * @param array $new_customer_data Array of customer (user) data.
		 * @param string $password_generated The generated password for the account.
		 */
		do_action( 'poocommerce_created_customer', $customer_id, $new_customer_data, $password_generated );

		return $customer_id;
	}
}

/**
 * Create a unique username for a new customer.
 *
 * @since 3.6.0
 * @param string $email New customer email address.
 * @param array  $new_user_args Array of new user args, maybe including first and last names.
 * @param string $suffix Append string to username to make it unique.
 * @return string Generated username.
 */
function wc_create_new_customer_username( $email, $new_user_args = array(), $suffix = '' ) {
	$username_parts = array();

	if ( isset( $new_user_args['first_name'] ) ) {
		$username_parts[] = sanitize_user( $new_user_args['first_name'], true );
	}

	if ( isset( $new_user_args['last_name'] ) ) {
		$username_parts[] = sanitize_user( $new_user_args['last_name'], true );
	}

	// Remove empty parts.
	$username_parts = array_filter( $username_parts );

	// If there are no parts, e.g. name had unicode chars, or was not provided, fallback to email.
	if ( empty( $username_parts ) ) {
		$email_parts    = explode( '@', $email );
		$email_username = $email_parts[0];

		// Exclude common prefixes.
		if ( in_array(
			$email_username,
			array(
				'sales',
				'hello',
				'mail',
				'contact',
				'info',
			),
			true
		) ) {
			// Get the domain part.
			$email_username = $email_parts[1];
		}

		$username_parts[] = sanitize_user( $email_username, true );
	}

	$username = wc_strtolower( implode( '.', $username_parts ) );

	if ( $suffix ) {
		$username .= $suffix;
	}

	/**
	 * WordPress 4.4 - filters the list of blocked usernames.
	 *
	 * @since 3.7.0
	 * @param array $usernames Array of blocked usernames.
	 */
	$illegal_logins = (array) apply_filters( 'illegal_user_logins', array() );

	// Stop illegal logins and generate a new random username.
	if ( in_array( strtolower( $username ), array_map( 'strtolower', $illegal_logins ), true ) ) {
		$new_args = array();

		/**
		 * Filter generated customer username.
		 *
		 * @since 3.7.0
		 * @param string $username      Generated username.
		 * @param string $email         New customer email address.
		 * @param array  $new_user_args Array of new user args, maybe including first and last names.
		 * @param string $suffix        Append string to username to make it unique.
		 */
		$new_args['first_name'] = apply_filters(
			'poocommerce_generated_customer_username',
			'woo_user_' . zeroise( wp_rand( 0, 9999 ), 4 ),
			$email,
			$new_user_args,
			$suffix
		);

		return wc_create_new_customer_username( $email, $new_args, $suffix );
	}

	if ( username_exists( $username ) ) {
		// Generate something unique to append to the username in case of a conflict with another user.
		$suffix = '-' . zeroise( wp_rand( 0, 9999 ), 4 );
		return wc_create_new_customer_username( $email, $new_user_args, $suffix );
	}

	/**
	 * Filter new customer username.
	 *
	 * @since 3.7.0
	 * @param string $username      Customer username.
	 * @param string $email         New customer email address.
	 * @param array  $new_user_args Array of new user args, maybe including first and last names.
	 * @param string $suffix        Append string to username to make it unique.
	 */
	return apply_filters( 'poocommerce_new_customer_username', $username, $email, $new_user_args, $suffix );
}

/**
 * Login a customer (set auth cookie and set global user object).
 *
 * @param int $customer_id Customer ID.
 */
function wc_set_customer_auth_cookie( $customer_id ) {
	wp_set_current_user( $customer_id );
	wp_set_auth_cookie( $customer_id, true );

	// Update session.
	if ( is_callable( array( WC()->session, 'init_session_cookie' ) ) ) {
		WC()->session->init_session_cookie();
	}
}

/**
 * Get past orders (by email) and update them.
 *
 * @param  int $customer_id Customer ID.
 * @return int
 */
function wc_update_new_customer_past_orders( $customer_id ) {
	$linked          = 0;
	$complete        = 0;
	$customer        = get_user_by( 'id', absint( $customer_id ) );
	$customer_orders = wc_get_orders(
		array(
			'limit'    => -1,
			'customer' => array( array( 0, $customer->user_email ) ),
			'return'   => 'ids',
		)
	);

	if ( ! empty( $customer_orders ) ) {
		foreach ( $customer_orders as $order_id ) {
			$order = wc_get_order( $order_id );
			if ( ! $order ) {
				continue;
			}

			$order->set_customer_id( $customer->ID );
			$order->save();

			if ( $order->has_downloadable_item() ) {
				$data_store = WC_Data_Store::load( 'customer-download' );
				$data_store->delete_by_order_id( $order->get_id() );
				wc_downloadable_product_permissions( $order->get_id(), true );
			}

			do_action( 'poocommerce_update_new_customer_past_order', $order_id, $customer );

			if ( $order->get_status() === OrderInternalStatus::COMPLETED ) {
				++$complete;
			}

			++$linked;
		}
	}

	if ( $complete ) {
		update_user_meta( $customer_id, 'paying_customer', 1 );
		Users::update_site_user_meta( $customer_id, 'wc_order_count', '' );
		Users::update_site_user_meta( $customer_id, 'wc_money_spent', '' );
		Users::delete_site_user_meta( $customer_id, 'wc_last_order' );
	}

	return $linked;
}

/**
 * Order payment completed - This is a paying customer.
 *
 * @param int $order_id Order ID.
 */
function wc_paying_customer( $order_id ) {
	$order       = wc_get_order( $order_id );
	$customer_id = $order->get_customer_id();

	if ( $customer_id > 0 && 'shop_order_refund' !== $order->get_type() ) {
		$customer = new WC_Customer( $customer_id );

		if ( ! $customer->get_is_paying_customer() ) {
			$customer->set_is_paying_customer( true );
			$customer->save();
		}
	}
}
add_action( 'poocommerce_payment_complete', 'wc_paying_customer' );
add_action( 'poocommerce_order_status_completed', 'wc_paying_customer' );

/**
 * Checks if a user (by email or ID or both) has bought an item.
 *
 * @param string $customer_email Customer email to check.
 * @param int    $user_id        User ID to check.
 * @param int    $product_id     Product ID to check.
 * @return bool
 */
function wc_customer_bought_product( $customer_email, $user_id, $product_id ) {
	global $wpdb;

	$result = apply_filters( 'poocommerce_pre_customer_bought_product', null, $customer_email, $user_id, $product_id );

	if ( null !== $result ) {
		return $result;
	}

	/**
	 * Whether to use lookup tables - it can optimize performance, but correctness depends on the frequency of the AS job.
	 *
	 * @since 9.7.0
	 *
	 * @param bool $enabled
	 * @param string $customer_email Customer email to check.
	 * @param int    $user_id User ID to check.
	 * @param int    $product_id Product ID to check.
	 * @return bool
	 */
	$use_lookup_tables = apply_filters( 'poocommerce_customer_bought_product_use_lookup_tables', false, $customer_email, $user_id, $product_id );

	if ( $use_lookup_tables ) {
		// Lookup tables get refreshed along with the `poocommerce_reports` transient version (due to async processing).
		// With high orders placement rate, this caching here will be short-lived (suboptimal for BFCM/Christmas and busy stores in general).
		$cache_version = WC_Cache_Helper::get_transient_version( 'poocommerce_reports' );
	} elseif ( '' === $customer_email && $user_id ) {
		// Optimized: for specific customers version with orders count (it's a user meta from in-memory populated datasets).
		// Best-case scenario for caching here, as it only depends on the customer orders placement rate.
		$cache_version = wc_get_customer_order_count( $user_id );
	} else {
		// Fallback: create, update, and delete operations on orders clears caches and refreshes `orders` transient version.
		// With high orders placement rate, this caching here will be short-lived (suboptimal for BFCM/Christmas and busy stores in general).
		// For the core, no use-cases for this branch. Themes/extensions are still valid use-cases.
		$cache_version = WC_Cache_Helper::get_transient_version( 'orders' );
	}

	$cache_group = 'orders';
	$cache_key   = 'wc_customer_bought_product_' . md5( $customer_email . '-' . $user_id . '-' . $use_lookup_tables );
	$cache_value = wp_cache_get( $cache_key, $cache_group );

	if ( isset( $cache_value['value'], $cache_value['version'] ) && $cache_value['version'] === $cache_version ) {
		$result = $cache_value['value'];
	} else {
		$customer_data = array( $user_id );

		if ( $user_id ) {
			$user = get_user_by( 'id', $user_id );

			if ( isset( $user->user_email ) ) {
				$customer_data[] = $user->user_email;
			}
		}

		if ( is_email( $customer_email ) ) {
			$customer_data[] = $customer_email;
		}

		$customer_data = array_map( 'esc_sql', array_filter( array_unique( $customer_data ) ) );
		$statuses      = array_map( 'esc_sql', wc_get_is_paid_statuses() );

		if ( count( $customer_data ) === 0 ) {
			return false;
		}

		if ( OrderUtil::custom_orders_table_usage_is_enabled() ) {
			$statuses       = array_map(
				function ( $status ) {
					return "wc-$status";
				},
				$statuses
			);
			$order_table    = OrdersTableDataStore::get_orders_table_name();
			$user_id_clause = '';
			if ( $user_id ) {
				$user_id_clause = 'OR o.customer_id = ' . absint( $user_id );
			}
			if ( $use_lookup_tables ) {
				// HPOS: yes, Lookup table: yes.
				$sql = "
SELECT DISTINCT product_or_variation_id FROM (
SELECT CASE WHEN product_id != 0 THEN product_id ELSE variation_id END AS product_or_variation_id
FROM {$wpdb->prefix}wc_order_product_lookup lookup
INNER JOIN $order_table AS o ON lookup.order_id = o.ID
WHERE o.status IN ('" . implode( "','", $statuses ) . "')
AND ( o.billing_email IN ('" . implode( "','", $customer_data ) . "') $user_id_clause )
) AS subquery
WHERE product_or_variation_id != 0
";
			} else {
				// HPOS: yes, Lookup table: no.
				$sql = "
SELECT DISTINCT im.meta_value FROM $order_table AS o
INNER JOIN {$wpdb->prefix}poocommerce_order_items AS i ON o.id = i.order_id
INNER JOIN {$wpdb->prefix}poocommerce_order_itemmeta AS im ON i.order_item_id = im.order_item_id
WHERE o.status IN ('" . implode( "','", $statuses ) . "')
AND im.meta_key IN ('_product_id', '_variation_id' )
AND im.meta_value != 0
AND ( o.billing_email IN ('" . implode( "','", $customer_data ) . "') $user_id_clause )
";
			}
			$result = $wpdb->get_col( $sql );
		} elseif ( $use_lookup_tables ) {
			// HPOS: no, Lookup table: yes.
			$result = $wpdb->get_col(
				"
SELECT DISTINCT product_or_variation_id FROM (
SELECT CASE WHEN lookup.product_id != 0 THEN lookup.product_id ELSE lookup.variation_id END AS product_or_variation_id
FROM {$wpdb->prefix}wc_order_product_lookup AS lookup
INNER JOIN {$wpdb->posts} AS p ON p.ID = lookup.order_id
INNER JOIN {$wpdb->postmeta} AS pm ON p.ID = pm.post_id
WHERE p.post_status IN ( 'wc-" . implode( "','wc-", $statuses ) . "' )
AND pm.meta_key IN ( '_billing_email', '_customer_user' )
AND pm.meta_value IN ( '" . implode( "','", $customer_data ) . "' )
) AS subquery
WHERE product_or_variation_id != 0
		"
			); // WPCS: unprepared SQL ok.
		} else {
			// HPOS: no, Lookup table: no.
			// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared
			$result = $wpdb->get_col(
				"
SELECT DISTINCT im.meta_value FROM {$wpdb->posts} AS p
INNER JOIN {$wpdb->postmeta} AS pm ON p.ID = pm.post_id
INNER JOIN {$wpdb->prefix}poocommerce_order_items AS i ON p.ID = i.order_id
INNER JOIN {$wpdb->prefix}poocommerce_order_itemmeta AS im ON i.order_item_id = im.order_item_id
WHERE p.post_status IN ( 'wc-" . implode( "','wc-", $statuses ) . "' ) AND p.post_type = 'shop_order'
AND pm.meta_key IN ( '_billing_email', '_customer_user' )
AND im.meta_key IN ( '_product_id', '_variation_id' )
AND im.meta_value != 0
AND pm.meta_value IN ( '" . implode( "','", $customer_data ) . "' )
		"
			);
			// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared
		}
		$result = array_map( 'absint', $result );

		wp_cache_set(
			$cache_key,
			array(
				'version' => $cache_version,
				'value'   => $result,
			),
			$cache_group,
			MONTH_IN_SECONDS
		);
	}
	return in_array( absint( $product_id ), $result, true );
}

/**
 * Checks if the current user has a role.
 *
 * @param string $role The role.
 * @return bool
 */
function wc_current_user_has_role( $role ) {
	return wc_user_has_role( wp_get_current_user(), $role );
}

/**
 * Checks if a user has a role.
 *
 * @param int|\WP_User $user The user.
 * @param string       $role The role.
 * @return bool
 */
function wc_user_has_role( $user, $role ) {
	if ( ! is_object( $user ) ) {
		$user = get_userdata( $user );
	}

	if ( ! $user || ! $user->exists() ) {
		return false;
	}

	return in_array( $role, $user->roles, true );
}

/**
 * Checks if a user has a certain capability.
 *
 * @param array $allcaps All capabilities.
 * @param array $caps    Capabilities.
 * @param array $args    Arguments.
 *
 * @return array The filtered array of all capabilities.
 */
function wc_customer_has_capability( $allcaps, $caps, $args ) {
	if ( isset( $caps[0] ) ) {
		switch ( $caps[0] ) {
			case 'view_order':
				$user_id = intval( $args[1] );
				$order   = wc_get_order( $args[2] );

				if ( $order && $user_id === $order->get_user_id() ) {
					$allcaps['view_order'] = true;
				}
				break;
			case 'pay_for_order':
				$user_id  = intval( $args[1] );
				$order_id = isset( $args[2] ) ? $args[2] : null;

				// When no order ID, we assume it's a new order
				// and thus, customer can pay for it.
				if ( ! $order_id ) {
					$allcaps['pay_for_order'] = true;
					break;
				}

				$order = wc_get_order( $order_id );

				if ( $order && ( $user_id === $order->get_user_id() || ! $order->get_user_id() ) ) {
					$allcaps['pay_for_order'] = true;
				}
				break;
			case 'order_again':
				$user_id = intval( $args[1] );
				$order   = wc_get_order( $args[2] );

				if ( $order && $user_id === $order->get_user_id() ) {
					$allcaps['order_again'] = true;
				}
				break;
			case 'cancel_order':
				$user_id = intval( $args[1] );
				$order   = wc_get_order( $args[2] );

				if ( $order && $user_id === $order->get_user_id() ) {
					$allcaps['cancel_order'] = true;
				}
				break;
			case 'download_file':
				$user_id  = intval( $args[1] );
				$download = $args[2];

				if ( $download && $user_id === $download->get_user_id() ) {
					$allcaps['download_file'] = true;
				}
				break;
		}
	}
	return $allcaps;
}
add_filter( 'user_has_cap', 'wc_customer_has_capability', 10, 3 );

/**
 * Safe way of allowing shop managers restricted capabilities that will remove
 * access to the capabilities if PooCommerce is deactivated.
 *
 * @since 3.5.4
 * @param bool[]   $allcaps Array of key/value pairs where keys represent a capability name and boolean values
 *                          represent whether the user has that capability.
 * @param string[] $caps    Required primitive capabilities for the requested capability.
 * @param array    $args Arguments that accompany the requested capability check.
 * @param WP_User  $user    The user object.
 * @return bool[]
 */
function wc_shop_manager_has_capability( $allcaps, $caps, $args, $user ) {

	if ( wc_user_has_role( $user, 'shop_manager' ) ) {
		// @see wc_modify_map_meta_cap, which limits editing to customers.
		$allcaps['edit_users'] = true;
	}

	return $allcaps;
}
add_filter( 'user_has_cap', 'wc_shop_manager_has_capability', 10, 4 );

/**
 * Modify the list of editable roles to prevent non-admin adding admin users.
 *
 * @param  array $roles Roles.
 * @return array
 */
function wc_modify_editable_roles( $roles ) {
	if ( is_multisite() && is_super_admin() ) {
		return $roles;
	}
	if ( ! wc_current_user_has_role( 'administrator' ) ) {
		unset( $roles['administrator'] );

		if ( wc_current_user_has_role( 'shop_manager' ) ) {
			$shop_manager_editable_roles = apply_filters( 'poocommerce_shop_manager_editable_roles', array( 'customer' ) );
			return array_intersect_key( $roles, array_flip( $shop_manager_editable_roles ) );
		}
	}

	return $roles;
}
add_filter( 'editable_roles', 'wc_modify_editable_roles' );

/**
 * Modify capabilities to prevent non-admin users editing admin users.
 *
 * $args[0] will be the user being edited in this case.
 *
 * @param  array  $caps    Array of caps.
 * @param  string $cap     Name of the cap we are checking.
 * @param  int    $user_id ID of the user being checked against.
 * @param  array  $args    Arguments.
 * @return array
 */
function wc_modify_map_meta_cap( $caps, $cap, $user_id, $args ) {
	if ( is_multisite() && is_super_admin() ) {
		return $caps;
	}
	switch ( $cap ) {
		case 'edit_user':
		case 'remove_user':
		case 'promote_user':
		case 'delete_user':
			if ( ! isset( $args[0] ) || $args[0] === $user_id ) {
				break;
			} elseif ( ! wc_current_user_has_role( 'administrator' ) ) {
				if ( wc_user_has_role( $args[0], 'administrator' ) ) {
					$caps[] = 'do_not_allow';
				} elseif ( wc_current_user_has_role( 'shop_manager' ) ) {
					// Shop managers can only edit customer info.
					$userdata                    = get_userdata( $args[0] );
					$shop_manager_editable_roles = apply_filters( 'poocommerce_shop_manager_editable_roles', array( 'customer' ) ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
					if ( property_exists( $userdata, 'roles' ) && ! empty( $userdata->roles ) && ! array_intersect( $userdata->roles, $shop_manager_editable_roles ) ) {
						$caps[] = 'do_not_allow';
					}
				}
			}
			break;
	}
	return $caps;
}
add_filter( 'map_meta_cap', 'wc_modify_map_meta_cap', 10, 4 );

/**
 * Get customer download permissions from the database.
 *
 * @param int $customer_id Customer/User ID.
 * @return array
 */
function wc_get_customer_download_permissions( $customer_id ) {
	$data_store = WC_Data_Store::load( 'customer-download' );
	return apply_filters( 'poocommerce_permission_list', $data_store->get_downloads_for_customer( $customer_id ), $customer_id ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
}

/**
 * Get customer available downloads.
 *
 * @param int $customer_id Customer/User ID.
 * @return array
 */
function wc_get_customer_available_downloads( $customer_id ) {
	$downloads   = array();
	$_product    = null;
	$order       = null;
	$file_number = 0;

	// Get results from valid orders only.
	$results = wc_get_customer_download_permissions( $customer_id );

	if ( $results ) {
		foreach ( $results as $result ) {
			$order_id = intval( $result->order_id );

			if ( ! $order || $order->get_id() !== $order_id ) {
				// New order.
				$order    = wc_get_order( $order_id );
				$_product = null;
			}

			// Make sure the order exists for this download.
			if ( ! $order ) {
				continue;
			}

			// Check if downloads are permitted.
			if ( ! $order->is_download_permitted() ) {
				continue;
			}

			$product_id = intval( $result->product_id );

			if ( ! $_product || $_product->get_id() !== $product_id ) {
				// New product.
				$file_number = 0;
				$_product    = wc_get_product( $product_id );
			}

			// Check product exists and has the file.
			if ( ! $_product || ! $_product->exists() || ! $_product->has_file( $result->download_id ) ) {
				continue;
			}

			$download_file = $_product->get_file( $result->download_id );

			// If the downloadable file has been disabled (it may be located in an untrusted location) then do not return it.
			if ( ! $download_file->get_enabled() ) {
				continue;
			}

			// Download name will be 'Product Name' for products with a single downloadable file, and 'Product Name - File X' for products with multiple files.
			// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
			$download_name = apply_filters(
				'poocommerce_downloadable_product_name',
				$download_file['name'],
				$_product,
				$result->download_id,
				$file_number
			);

			$downloads[] = array(
				'download_url'        => add_query_arg(
					array(
						'download_file' => $product_id,
						'order'         => $result->order_key,
						'email'         => rawurlencode( $result->user_email ),
						'key'           => $result->download_id,
					),
					home_url( '/' )
				),
				'download_id'         => $result->download_id,
				'product_id'          => $_product->get_id(),
				'product_name'        => $_product->get_name(),
				'product_url'         => $_product->is_visible() ? $_product->get_permalink() : '', // Since 3.3.0.
				'download_name'       => $download_name,
				'order_id'            => $order->get_id(),
				'order_key'           => $order->get_order_key(),
				'downloads_remaining' => $result->downloads_remaining,
				'access_expires'      => $result->access_expires,
				'file'                => array(
					'name' => $download_file->get_name(),
					'file' => $download_file->get_file(),
				),
			);

			++$file_number;
		}
	}

	// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
	return apply_filters( 'poocommerce_customer_available_downloads', $downloads, $customer_id );
}

/**
 * Get total spent by customer.
 *
 * @param  int $user_id User ID.
 * @return string
 */
function wc_get_customer_total_spent( $user_id ) {
	$customer = new WC_Customer( $user_id );
	return $customer->get_total_spent();
}

/**
 * Get total orders by customer.
 *
 * @param  int $user_id User ID.
 * @return int
 */
function wc_get_customer_order_count( $user_id ) {
	$customer = new WC_Customer( $user_id );
	return $customer->get_order_count();
}

/**
 * Reset _customer_user on orders when a user is deleted.
 *
 * @param int $user_id User ID.
 */
function wc_reset_order_customer_id_on_deleted_user( $user_id ) {
	global $wpdb;

	if ( OrderUtil::custom_orders_table_usage_is_enabled() ) {
		$order_table_ds = wc_get_container()->get( OrdersTableDataStore::class );
		$order_table    = $order_table_ds::get_orders_table_name();
		$wpdb->update(
			$order_table,
			array(
				'customer_id'      => 0,
				'date_updated_gmt' => current_time( 'mysql', true ),
			),
			array(
				'customer_id' => $user_id,
			),
			array(
				'%d',
				'%s',
			),
			array(
				'%d',
			)
		);
	}

	if ( ! OrderUtil::custom_orders_table_usage_is_enabled() || OrderUtil::is_custom_order_tables_in_sync() ) {
		$wpdb->update(
			$wpdb->postmeta,
			array(
				'meta_value' => 0, //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			),
			array(
				'meta_key'   => '_customer_user', //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value' => $user_id, //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);
	}
}

add_action( 'deleted_user', 'wc_reset_order_customer_id_on_deleted_user' );

/**
 * Get review verification status.
 *
 * @param  int $comment_id Comment ID.
 * @return bool
 */
function wc_review_is_from_verified_owner( $comment_id ) {
	$verified = get_comment_meta( $comment_id, 'verified', true );
	return '' === $verified ? WC_Comments::add_comment_purchase_verification( $comment_id ) : (bool) $verified;
}

/**
 * Disable author archives for customers.
 *
 * @since 2.5.0
 */
function wc_disable_author_archives_for_customers() {
	global $author;

	if ( is_author() ) {
		$user = get_user_by( 'id', $author );

		if ( user_can( $user, 'customer' ) && ! user_can( $user, 'edit_posts' ) ) {
			wp_safe_redirect( wc_get_page_permalink( 'shop' ) );
			exit;
		}
	}
}

add_action( 'template_redirect', 'wc_disable_author_archives_for_customers' );

/**
 * Hooks into the `profile_update` hook to set the user last updated timestamp.
 *
 * @since 2.6.0
 * @param int   $user_id The user that was updated.
 * @param array $old     The profile fields pre-change.
 */
function wc_update_profile_last_update_time( $user_id, $old ) {
	wc_set_user_last_update_time( $user_id );
}

add_action( 'profile_update', 'wc_update_profile_last_update_time', 10, 2 );

/**
 * Hooks into the update user meta function to set the user last updated timestamp.
 *
 * @since 2.6.0
 * @param int    $meta_id     ID of the meta object that was changed.
 * @param int    $user_id     The user that was updated.
 * @param string $meta_key    Name of the meta key that was changed.
 * @param mixed  $_meta_value Value of the meta that was changed.
 */
function wc_meta_update_last_update_time( $meta_id, $user_id, $meta_key, $_meta_value ) {
	$keys_to_track = apply_filters( 'poocommerce_user_last_update_fields', array( 'first_name', 'last_name' ) ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment

	$update_time = in_array( $meta_key, $keys_to_track, true ) ? true : false;
	$update_time = 'billing_' === substr( $meta_key, 0, 8 ) ? true : $update_time;
	$update_time = 'shipping_' === substr( $meta_key, 0, 9 ) ? true : $update_time;

	if ( $update_time ) {
		wc_set_user_last_update_time( $user_id );
	}
}

add_action( 'update_user_meta', 'wc_meta_update_last_update_time', 10, 4 );

/**
 * Sets a user's "last update" time to the current timestamp.
 *
 * @since 2.6.0
 * @param int $user_id The user to set a timestamp for.
 */
function wc_set_user_last_update_time( $user_id ) {
	update_user_meta( $user_id, 'last_update', gmdate( 'U' ) );
}

/**
 * Get customer saved payment methods list.
 *
 * @since 2.6.0
 * @param int $customer_id Customer ID.
 * @return array
 */
function wc_get_customer_saved_methods_list( $customer_id ) {
	return apply_filters( 'poocommerce_saved_payment_methods_list', array(), $customer_id ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
}

/**
 * Get info about customer's last order.
 *
 * @since 2.6.0
 * @param int $customer_id Customer ID.
 * @return WC_Order|bool Order object if successful or false.
 */
function wc_get_customer_last_order( $customer_id ) {
	$customer = new WC_Customer( $customer_id );

	return $customer->get_last_order();
}

/**
 * When a user is deleted in WordPress, delete corresponding PooCommerce data.
 *
 * @param int $user_id User ID being deleted.
 */
function wc_delete_user_data( $user_id ) {
	global $wpdb;

	// Clean up sessions.
	$wpdb->delete(
		$wpdb->prefix . 'poocommerce_sessions',
		array(
			'session_key' => $user_id,
		)
	);

	// Revoke API keys.
	$wpdb->delete(
		$wpdb->prefix . 'poocommerce_api_keys',
		array(
			'user_id' => $user_id,
		)
	);

	// Clean up payment tokens.
	$payment_tokens = WC_Payment_Tokens::get_customer_tokens( $user_id );

	foreach ( $payment_tokens as $payment_token ) {
		$payment_token->delete();
	}
}
add_action( 'delete_user', 'wc_delete_user_data' );

/**
 * Store user agents. Used for tracker.
 *
 * @since 3.0.0
 * @param string     $user_login User login.
 * @param int|object $user       User.
 */
function wc_maybe_store_user_agent( $user_login, $user ) {
	if ( 'yes' === get_option( 'poocommerce_allow_tracking', 'no' ) && user_can( $user, 'manage_poocommerce' ) ) {
		$admin_user_agents   = array_filter( (array) get_option( 'poocommerce_tracker_ua', array() ) );
		$admin_user_agents[] = wc_get_user_agent();
		update_option( 'poocommerce_tracker_ua', array_unique( $admin_user_agents ), false );
	}
}
add_action( 'wp_login', 'wc_maybe_store_user_agent', 10, 2 );

/**
 * Update logic triggered on login.
 *
 * @since 3.4.0
 * @param string $user_login User login.
 * @param object $user       User.
 */
function wc_user_logged_in( $user_login, $user ) {
	wc_update_user_last_active( $user->ID );
}
add_action( 'wp_login', 'wc_user_logged_in', 10, 2 );

/**
 * Update when the user was last active.
 *
 * @since 3.4.0
 */
function wc_current_user_is_active() {
	if ( ! is_user_logged_in() ) {
		return;
	}
	wc_update_user_last_active( get_current_user_id() );
}
add_action( 'wp', 'wc_current_user_is_active', 10 );

/**
 * Set the user last active timestamp to now.
 *
 * @since 3.4.0
 * @param int $user_id User ID to mark active.
 */
function wc_update_user_last_active( $user_id ) {
	if ( ! $user_id ) {
		return;
	}
	update_user_meta( $user_id, 'wc_last_active', (string) strtotime( gmdate( 'Y-m-d', time() ) ) );
}

/**
 * Translate WC roles using the poocommerce textdomain.
 *
 * @since 3.7.0
 * @param string $translation  Translated text.
 * @param string $text         Text to translate.
 * @param string $context      Context information for the translators.
 * @param string $domain       Text domain. Unique identifier for retrieving translated strings.
 * @return string
 */
function wc_translate_user_roles( $translation, $text, $context, $domain ) {
	// translate_user_role() only accepts a second parameter starting in WP 5.2.
	if ( version_compare( get_bloginfo( 'version' ), '5.2', '<' ) ) {
		return $translation;
	}

	if ( 'User role' === $context && 'default' === $domain && in_array( $text, array( 'Shop manager', 'Customer' ), true ) ) {
		return translate_user_role( $text, 'poocommerce' );
	}

	return $translation;
}
add_filter( 'gettext_with_context', 'wc_translate_user_roles', 10, 4 );
