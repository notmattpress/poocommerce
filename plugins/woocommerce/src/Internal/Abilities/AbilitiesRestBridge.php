<?php
/**
 * Abilities REST Bridge class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Abilities;

use Automattic\PooCommerce\Internal\Abilities\REST\RestAbilityFactory;
use Automattic\PooCommerce\Internal\MCP\MCPAdapterProvider;

defined( 'ABSPATH' ) || exit;

/**
 * Abilities REST Bridge class for PooCommerce.
 *
 * Configuration-driven registry that exposes REST endpoints as WordPress abilities.
 * Each ability is explicitly configured with ID, label, description, and operation.
 */
class AbilitiesRestBridge {

	/**
	 * Get REST controller configurations with explicit IDs, labels, and descriptions.
	 *
	 * @return array Controller configurations.
	 */
	private static function get_configurations(): array {
		return array(
			array(
				'controller' => \WC_REST_Products_Controller::class,
				'route'      => '/wc/v3/products',
				'abilities'  => array(
					array(
						'id'          => 'poocommerce/products-list',
						'operation'   => 'list',
						'label'       => __( 'List Products', 'poocommerce' ),
						'description' => __( 'Retrieve a paginated list of products with optional filters for status, category, price range, and other attributes.', 'poocommerce' ),
					),
					array(
						'id'          => 'poocommerce/products-get',
						'operation'   => 'get',
						'label'       => __( 'Get Product', 'poocommerce' ),
						'description' => __( 'Retrieve detailed information about a single product by ID, including price, description, images, and metadata.', 'poocommerce' ),
					),
					array(
						'id'          => 'poocommerce/products-create',
						'operation'   => 'create',
						'label'       => __( 'Create Product', 'poocommerce' ),
						'description' => __( 'Create a new product in PooCommerce with name, price, description, and other product attributes.', 'poocommerce' ),
					),
					array(
						'id'          => 'poocommerce/products-update',
						'operation'   => 'update',
						'label'       => __( 'Update Product', 'poocommerce' ),
						'description' => __( 'Update an existing product by modifying its attributes such as price, stock, description, or metadata.', 'poocommerce' ),
					),
					array(
						'id'          => 'poocommerce/products-delete',
						'operation'   => 'delete',
						'label'       => __( 'Delete Product', 'poocommerce' ),
						'description' => __( 'Permanently delete a product from the store. This action cannot be undone.', 'poocommerce' ),
					),
				),
			),
			array(
				'controller' => \WC_REST_Orders_Controller::class,
				'route'      => '/wc/v3/orders',
				'abilities'  => array(
					array(
						'id'          => 'poocommerce/orders-list',
						'operation'   => 'list',
						'label'       => __( 'List Orders', 'poocommerce' ),
						'description' => __( 'Retrieve a paginated list of orders with optional filters for status, customer, date range, and other criteria.', 'poocommerce' ),
					),
					array(
						'id'          => 'poocommerce/orders-get',
						'operation'   => 'get',
						'label'       => __( 'Get Order', 'poocommerce' ),
						'description' => __( 'Retrieve detailed information about a single order by ID, including line items, customer details, and payment information.', 'poocommerce' ),
					),
					array(
						'id'          => 'poocommerce/orders-create',
						'operation'   => 'create',
						'label'       => __( 'Create Order', 'poocommerce' ),
						'description' => __( 'Create a new order with customer information, line items, shipping details, and payment information.', 'poocommerce' ),
					),
					array(
						'id'          => 'poocommerce/orders-update',
						'operation'   => 'update',
						'label'       => __( 'Update Order', 'poocommerce' ),
						'description' => __( 'Update an existing order by modifying status, customer information, line items, or other order details.', 'poocommerce' ),
					),
				),
			),
		);
	}

	/**
	 * Initialize the ability registration.
	 *
	 * @internal
	 */
	final public static function init(): void {
		/*
		 * Register abilities when Abilities API is ready.
		 * Support both old (pre-6.9) and new (6.9+) action names.
		 */
		add_action( 'abilities_api_init', array( __CLASS__, 'register_abilities' ) );
		add_action( 'wp_abilities_api_init', array( __CLASS__, 'register_abilities' ) );
	}

	/**
	 * Register all configured abilities.
	 */
	public static function register_abilities(): void {
		// Only register abilities if this is an MCP endpoint request.
		// We check here (on abilities_api_init action) rather than earlier
		// because REST request detection requires the WordPress REST infrastructure
		// to be fully initialized.
		if ( ! MCPAdapterProvider::is_mcp_request() ) {
			return;
		}

		foreach ( self::get_configurations() as $config ) {
			RestAbilityFactory::register_controller_abilities( $config );
		}
	}
}
