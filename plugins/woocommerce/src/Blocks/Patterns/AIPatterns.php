<?php
namespace Automattic\PooCommerce\Blocks\Patterns;

use Automattic\PooCommerce\Blocks\AI\Connection;
use Automattic\PooCommerce\Blocks\AIContent\UpdatePatterns;
use Automattic\PooCommerce\Blocks\AIContent\UpdateProducts;
use Automattic\PooCommerce\Blocks\Images\Pexels;

/**
 * AIPatterns class.
 *
 * @internal
 */
class AIPatterns {
	const PATTERNS_AI_DATA_POST_TYPE = 'patterns_ai_data';

	/**
	 * Constructor for the class.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_patterns_ai_data_post_type' ) );

		add_action( 'update_option_woo_ai_describe_store_description', array( $this, 'schedule_on_option_update' ), 10, 2 );
		add_action( 'update_option_woo_ai_describe_store_description', array( $this, 'update_ai_connection_allowed_option' ), 10, 2 );
		add_action( 'upgrader_process_complete', array( $this, 'schedule_on_plugin_update' ), 10, 2 );
		add_action( 'poocommerce_update_patterns_content', array( $this, 'update_patterns_content' ) );
	}

	/**
	 * Register the Patterns AI Data post type to store patterns with the AI-generated content.
	 */
	public function register_patterns_ai_data_post_type() {
		register_post_type(
			self::PATTERNS_AI_DATA_POST_TYPE,
			array(
				'labels'           => array(
					'name'          => __( 'Patterns AI Data', 'poocommerce' ),
					'singular_name' => __( 'Patterns AI Data', 'poocommerce' ),
				),
				'public'           => false,
				'hierarchical'     => false,
				'rewrite'          => false,
				'query_var'        => false,
				'delete_with_user' => false,
				'can_export'       => true,
			)
		);
	}

	/**
	 * Make sure the 'poocommerce_blocks_allow_ai_connection' option is set to true if the site is connected to AI.
	 *
	 * @return bool
	 */
	public function update_ai_connection_allowed_option(): bool {
		$ai_connection = new Connection();

		$site_id = $ai_connection->get_site_id();

		if ( is_wp_error( $site_id ) ) {
			return update_option( 'poocommerce_blocks_allow_ai_connection', false, true );
		}

		$token = $ai_connection->get_jwt_token( $site_id );

		if ( is_wp_error( $token ) ) {
			return update_option( 'poocommerce_blocks_allow_ai_connection', false, true );
		}

		return update_option( 'poocommerce_blocks_allow_ai_connection', true, true );
	}

	/**
	 * Update the patterns content when the store description is changed.
	 *
	 * @param string $option The option name.
	 * @param string $value The option value.
	 */
	public function schedule_on_option_update( $option, $value ) {
		$last_business_description = get_option( 'last_business_description_with_ai_content_generated' );

		if ( $last_business_description === $value ) {
			return;
		}

		$this->schedule_patterns_content_update( $value );
	}

	/**
	 * Update the patterns content when the PooCommerce Blocks plugin is updated.
	 *
	 * @param \WP_Upgrader $upgrader_object  WP_Upgrader instance.
	 * @param array        $options  Array of bulk item update data.
	 */
	public function schedule_on_plugin_update( $upgrader_object, $options ) {
		if ( 'update' === $options['action'] && 'plugin' === $options['type'] && isset( $options['plugins'] ) ) {
			foreach ( $options['plugins'] as $plugin ) {
				if ( str_contains( $plugin, 'poocommerce.php' ) ) {
					$business_description = get_option( 'woo_ai_describe_store_description' );

					if ( $business_description ) {
						$this->schedule_patterns_content_update( $business_description );
					}
				}
			}
		}
	}

	/**
	 * Update the patterns content when the store description is changed.
	 *
	 * @param string $business_description The business description.
	 */
	public function schedule_patterns_content_update( $business_description ) {
		if ( ! class_exists( 'PooCommerce' ) ) {
			return;
		}

		$action_scheduler = WP_PLUGIN_DIR . '/poocommerce/packages/action-scheduler/action-scheduler.php';

		if ( ! file_exists( $action_scheduler ) ) {
			return;
		}

		require_once $action_scheduler;

		as_schedule_single_action( time(), 'poocommerce_update_patterns_content', array( $business_description ) );
	}

	/**
	 * Update the patterns content.
	 *
	 * @return bool|string|\WP_Error
	 */
	public function update_patterns_content() {
		$allow_ai_connection = get_option( 'poocommerce_blocks_allow_ai_connection' );

		if ( ! $allow_ai_connection ) {
			return new \WP_Error(
				'ai_connection_not_allowed',
				__( 'AI content generation is not allowed on this store. Update your store settings if you wish to enable this feature.', 'poocommerce' )
			);
		}

		$ai_connection = new Connection();

		$site_id = $ai_connection->get_site_id();

		if ( is_wp_error( $site_id ) ) {
			return $site_id->get_error_message();
		}

		$token = $ai_connection->get_jwt_token( $site_id );

		if ( is_wp_error( $token ) ) {
			return $token->get_error_message();
		}

		$business_description = get_option( 'woo_ai_describe_store_description' );

		$images = ( new Pexels() )->get_images( $ai_connection, $token, $business_description );

		if ( is_wp_error( $images ) ) {
			return $images->get_error_message();
		}

		$populate_patterns = ( new UpdatePatterns() )->generate_content( $ai_connection, $token, $images, $business_description );

		if ( is_wp_error( $populate_patterns ) ) {
			return $populate_patterns->get_error_message();
		}

		$populate_products = ( new UpdateProducts() )->generate_content( $ai_connection, $token, $images, $business_description );

		if ( is_wp_error( $populate_products ) ) {
			return $populate_products->get_error_message();
		}

		return true;
	}
}
