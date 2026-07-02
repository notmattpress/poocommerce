<?php
/**
 * Shared admin REST permission checks.
 *
 * @package Automattic\PooCommerce\SubscriptionsEngine\Integration\Support
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\SubscriptionsEngine\Integration\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Shared admin REST permission checks.
 */
class RESTPermissions {

	/**
	 * Require a logged in user with the manage_poocommerce capability.
	 *
	 * @return true|\WP_Error
	 */
	public function require_admin_permission() {
		if ( ! is_user_logged_in() ) {
			return new \WP_Error(
				'poocommerce_subscriptions_engine_not_authenticated',
				__( 'You must be logged in to access this resource.', 'poocommerce-subscriptions-engine' ),
				array( 'status' => 401 )
			);
		}

		// phpcs:ignore WordPress.WP.Capabilities.Unknown -- PooCommerce registers manage_poocommerce.
		if ( ! current_user_can( 'manage_poocommerce' ) ) {
			return new \WP_Error(
				'poocommerce_subscriptions_engine_insufficient_permissions',
				__( 'Sorry, you are not allowed to access this resource.', 'poocommerce-subscriptions-engine' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}
}
