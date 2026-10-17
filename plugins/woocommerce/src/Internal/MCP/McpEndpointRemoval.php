<?php
/**
 * McpEndpointRemoval class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\MCP;

use Automattic\PooCommerce\Proxies\LegacyProxy;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * Handles the removal of the PooCommerce MCP endpoint (poocommerce/mcp) and its REST-derived abilities.
 *
 * PooCommerce abilities remain registered through the WordPress Abilities API, and the MCP Adapter
 * plugin exposes them to MCP clients.
 *
 * @since 11.3.0
 */
class McpEndpointRemoval {

	/**
	 * PooCommerce version that removed the PooCommerce MCP endpoint.
	 *
	 * @var string
	 */
	public const REMOVED_IN = '11.3.0';

	/**
	 * Documentation for using PooCommerce abilities with MCP.
	 *
	 * @var string
	 */
	public const DOCS_URL = 'https://developer.poocommerce.com/docs/features/mcp/';

	/**
	 * Namespace of the removed PooCommerce MCP endpoint.
	 *
	 * @var string
	 */
	private const ENDPOINT_NAMESPACE = 'poocommerce';

	/**
	 * Route of the removed PooCommerce MCP endpoint.
	 *
	 * @var string
	 */
	private const ENDPOINT_ROUTE = '/mcp';

	/**
	 * Option that stored whether the removed PooCommerce MCP feature was enabled.
	 *
	 * @var string
	 */
	private const FEATURE_OPTION = 'poocommerce_feature_mcp_integration_enabled';

	/**
	 * Name of the admin notice about the removal, used for dismissal.
	 *
	 * @var string
	 */
	public const REMOVED_NOTICE = 'mcp_endpoint_removed';

	/**
	 * Plugin file of the MCP Adapter plugin from WordPress.org.
	 *
	 * @var string
	 */
	private const ADAPTER_PLUGIN_FILE = 'mcp-adapter/mcp-adapter.php';

	/**
	 * Query argument added to the notice's activation link, so activations started from the notice can be recognized.
	 *
	 * @var string
	 */
	private const NOTICE_ACTIVATION_ARG = 'wc-mcp-removal-notice';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'handle_rest_api_init' ) );
		add_action( 'admin_notices', array( $this, 'handle_admin_notices' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'handle_admin_enqueue_scripts' ) );
		add_action( 'activated_plugin', array( $this, 'handle_activated_plugin' ) );
		add_action( 'poocommerce_hide_' . self::REMOVED_NOTICE . '_notice', array( $this, 'handle_poocommerce_hide_mcp_endpoint_removed_notice' ) );
	}

	/**
	 * Handle the activated_plugin hook.
	 *
	 * When the MCP Adapter plugin is activated from the removal notice's link, the store has acted on the notice,
	 * so delete the old feature option that triggers it for every admin.
	 *
	 * @internal
	 *
	 * @param mixed $plugin Path to the activated plugin file, relative to the plugins directory.
	 */
	public function handle_activated_plugin( $plugin ): void {
		// Core verified the activation nonce before activating; the argument only identifies where the activation started.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( self::ADAPTER_PLUGIN_FILE === $plugin && isset( $_GET[ self::NOTICE_ACTIVATION_ARG ] ) ) {
			delete_option( self::FEATURE_OPTION );
		}
	}

	/**
	 * Handle the poocommerce_hide_mcp_endpoint_removed_notice hook.
	 *
	 * Dismissing the removal notice acts on it for the whole store, so delete the old feature option that triggers it.
	 *
	 * @internal
	 */
	public function handle_poocommerce_hide_mcp_endpoint_removed_notice(): void {
		delete_option( self::FEATURE_OPTION );
	}

	/**
	 * Handle the admin_enqueue_scripts hook.
	 *
	 * Loads the core scripts that open the MCP Adapter plugin details in a modal, only when the notice shows the install link.
	 *
	 * @internal
	 */
	public function handle_admin_enqueue_scripts(): void {
		if ( ! $this->should_show_removed_notice() || 'install' !== $this->get_adapter_link_type() ) {
			return;
		}

		add_thickbox();
		wp_enqueue_script( 'plugin-install' );
	}

	/**
	 * Handle the admin_notices hook.
	 *
	 * Tells stores that had the PooCommerce MCP feature enabled what was removed and how to keep using PooCommerce with MCP.
	 *
	 * @internal
	 */
	public function handle_admin_notices(): void {
		if ( ! $this->should_show_removed_notice() ) {
			return;
		}

		$message = sprintf(
			'<strong>%1$s</strong> %2$s <a href="%3$s" target="_blank" rel="noopener noreferrer">%4$s</a>',
			esc_html__( 'PooCommerce MCP has been removed.', 'poocommerce' ),
			esc_html(
				sprintf(
					/* translators: %s: PooCommerce version. */
					__( 'As of PooCommerce %s, the PooCommerce MCP endpoint (/wp-json/poocommerce/mcp), its REST API key authentication, and its REST-based product and order tools are no longer available. PooCommerce abilities are still available through the WordPress Abilities API. Use the MCP Adapter plugin to connect MCP clients to them.', 'poocommerce' ),
					self::REMOVED_IN
				)
			),
			esc_url( self::DOCS_URL ),
			esc_html__( 'Learn more', 'poocommerce' )
		);

		$link_type = $this->get_adapter_link_type();
		if ( 'install' === $link_type ) {
			$message .= sprintf(
				' | <a href="%1$s" class="thickbox open-plugin-details-modal" data-title="%2$s">%3$s</a>',
				esc_url( network_admin_url( 'plugin-install.php?tab=plugin-information&plugin=mcp-adapter&TB_iframe=true&width=600&height=550' ) ),
				esc_attr__( 'MCP Adapter', 'poocommerce' ),
				esc_html__( 'Install MCP Adapter', 'poocommerce' )
			);
		} elseif ( 'activate' === $link_type ) {
			$message .= sprintf(
				' | <a href="%1$s">%2$s</a>',
				esc_url( wp_nonce_url( admin_url( 'plugins.php?action=activate&plugin=' . rawurlencode( self::ADAPTER_PLUGIN_FILE ) . '&' . self::NOTICE_ACTIVATION_ARG . '=1' ), 'activate-plugin_' . self::ADAPTER_PLUGIN_FILE ) ),
				esc_html__( 'Activate MCP Adapter', 'poocommerce' )
			);
		}

		$dismiss_url = wp_nonce_url(
			add_query_arg( 'wc-hide-notice', self::REMOVED_NOTICE ),
			'poocommerce_hide_notices_nonce',
			'_wc_notice_nonce'
		);

		echo wp_kses_post(
			'<div class="notice notice-warning is-dismissible">'
			. '<a class="poocommerce-message-close notice-dismiss" style="text-decoration: none;" href="' . esc_url( $dismiss_url ) . '" aria-label="' . esc_attr__( 'Dismiss this notice', 'poocommerce' ) . '"></a>'
			. '<p>' . $message . '</p>'
			. '</div>'
		);
	}

	/**
	 * Check whether the removal notice should show to the current user.
	 *
	 * @return bool
	 */
	private function should_show_removed_notice(): bool {
		return 'yes' === get_option( self::FEATURE_OPTION )
			&& current_user_can( 'manage_poocommerce' )
			&& ! \WC_Admin_Notices::user_has_dismissed_notice( self::REMOVED_NOTICE );
	}

	/**
	 * Decide which MCP Adapter link the removal notice shows to the current user.
	 *
	 * No link is shown when an MCP adapter is already loaded, from the MCP Adapter plugin or any other plugin.
	 *
	 * @return string 'install', 'activate', or '' for no link.
	 */
	private function get_adapter_link_type(): string {
		if ( self::is_mcp_adapter_available() ) {
			return '';
		}

		$proxy = wc_get_container()->get( LegacyProxy::class );
		if ( $proxy->call_function( 'file_exists', WP_PLUGIN_DIR . '/' . self::ADAPTER_PLUGIN_FILE ) ) {
			return current_user_can( 'activate_plugins' ) ? 'activate' : '';
		}

		return current_user_can( 'install_plugins' ) ? 'install' : '';
	}

	/**
	 * Check whether an MCP adapter is loaded, from the MCP Adapter plugin or any other plugin.
	 *
	 * @return bool
	 */
	private static function is_mcp_adapter_available(): bool {
		return (bool) wc_get_container()->get( LegacyProxy::class )->call_function( 'class_exists', 'WP\MCP\Core\McpAdapter' );
	}

	/**
	 * Handle the rest_api_init hook.
	 *
	 * Registers the removed PooCommerce MCP endpoint so MCP clients that still use it get an explanation instead of a 404.
	 *
	 * @internal
	 */
	public function handle_rest_api_init(): void {
		register_rest_route(
			self::ENDPOINT_NAMESPACE,
			self::ENDPOINT_ROUTE,
			array(
				'methods'             => WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'get_endpoint_removed_response' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Respond to a request to the removed PooCommerce MCP endpoint.
	 *
	 * The response is a JSON-RPC error, which MCP clients surface to the user or agent, sent with HTTP status 410 Gone.
	 *
	 * @internal
	 *
	 * @param WP_REST_Request $request The REST request.
	 * @phpstan-param WP_REST_Request<array<string, mixed>> $request
	 * @return WP_REST_Response
	 */
	public function get_endpoint_removed_response( WP_REST_Request $request ): WP_REST_Response {
		$params     = $request->get_json_params();
		$request_id = is_array( $params ) && isset( $params['id'] ) && ( is_string( $params['id'] ) || is_int( $params['id'] ) ) ? $params['id'] : null;
		$adapter    = rest_url( 'mcp/mcp-adapter-default-server' );

		return new WP_REST_Response(
			array(
				'jsonrpc' => '2.0',
				'id'      => $request_id,
				'error'   => array(
					'code'    => -32000,
					'message' => sprintf(
						/* translators: 1: PooCommerce version, 2: MCP Adapter endpoint URL, 3: Documentation URL. */
						__( 'The PooCommerce MCP endpoint (poocommerce/mcp) was removed in PooCommerce %1$s. To keep using PooCommerce with MCP, install and activate the MCP Adapter plugin (https://wordpress.org/plugins/mcp-adapter/) on this site, then connect your MCP client to %2$s using a WordPress application password. Documentation: %3$s', 'poocommerce' ),
						self::REMOVED_IN,
						$adapter,
						self::DOCS_URL
					),
					'data'    => array(
						'replacement_endpoint' => $adapter,
						'documentation_url'    => self::DOCS_URL,
					),
				),
			),
			410
		);
	}

	/**
	 * Report a call to code that was removed along with the PooCommerce MCP endpoint.
	 *
	 * @param string $function_name The removed function or method that was called.
	 */
	public static function doing_it_wrong( string $function_name ): void {
		wc_doing_it_wrong(
			$function_name,
			sprintf(
				/* translators: 1: Function or method name, 2: PooCommerce version, 3: Documentation URL. */
				__( '%1$s was removed in PooCommerce %2$s along with the PooCommerce MCP endpoint and its REST-based abilities. PooCommerce abilities remain available through the WordPress Abilities API, and the MCP Adapter plugin exposes them to MCP clients. See %3$s.', 'poocommerce' ),
				$function_name,
				self::REMOVED_IN,
				self::DOCS_URL
			),
			self::REMOVED_IN
		);
	}
}
