<?php
/**
 * Abilities Categories class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Abilities;

defined( 'ABSPATH' ) || exit;

/**
 * Abilities Categories class for PooCommerce.
 *
 * Registers categories for PooCommerce abilities to improve organization
 * and discoverability in the WordPress Abilities API v0.3.0+.
 */
class AbilitiesCategories {

	/**
	 * Initialize category registration.
	 *
	 * @internal
	 */
	final public static function init(): void {
		/*
		 * Register categories when Abilities API categories are ready.
		 * Support both old (pre-6.9) and new (6.9+) action names.
		 */
		add_action( 'abilities_api_categories_init', array( __CLASS__, 'register_categories' ) );
		add_action( 'wp_abilities_api_categories_init', array( __CLASS__, 'register_categories' ) );
	}

	/**
	 * Register PooCommerce ability categories.
	 */
	public static function register_categories(): void {
		// Only register if the function exists.
		if ( ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		wp_register_ability_category(
			'poocommerce-rest',
			array(
				'label'       => __( 'PooCommerce REST API', 'poocommerce' ),
				'description' => __( 'REST API operations for PooCommerce resources including products, orders, and other store data.', 'poocommerce' ),
			)
		);
	}
}
