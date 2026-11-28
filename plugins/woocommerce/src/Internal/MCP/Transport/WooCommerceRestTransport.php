<?php
/**
 * PooCommerce MCP REST Transport class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\MCP\Transport;

use Automattic\PooCommerce\Internal\MCP\McpEndpointRemoval;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Formerly authenticated requests to the PooCommerce MCP endpoint with PooCommerce REST API keys.
 *
 * Kept so existing callers don't fatal. It no longer extends the MCP adapter's HttpTransport, and the
 * methods only report incorrect usage and deny access.
 *
 * @deprecated 11.3.0 The PooCommerce MCP endpoint was removed. Use the MCP Adapter plugin to access PooCommerce abilities over MCP.
 */
class PooCommerceRestTransport {

	/**
	 * Constructor.
	 *
	 * @deprecated 11.3.0
	 *
	 * @param mixed $context The transport context. Ignored.
	 */
	public function __construct( $context = null ) {
		unset( $context ); // Kept for backward compatibility.
		McpEndpointRemoval::doing_it_wrong( __METHOD__ );
	}

	/**
	 * Formerly checked access to the PooCommerce MCP endpoint.
	 *
	 * @deprecated 11.3.0
	 *
	 * @param \WP_REST_Request<array<string, mixed>>|null $request The REST request object. Ignored.
	 * @return WP_Error Always an error, since the endpoint was removed.
	 */
	public function check_permission( $request = null ) {
		unset( $request ); // Kept for backward compatibility.
		McpEndpointRemoval::doing_it_wrong( __METHOD__ );
		return self::get_removed_error();
	}

	/**
	 * Formerly validated a request to the PooCommerce MCP endpoint.
	 *
	 * @deprecated 11.3.0
	 *
	 * @param \WP_REST_Request $request The REST request object. Ignored.
	 * @phpstan-param \WP_REST_Request<array<string, mixed>> $request
	 * @return WP_Error Always an error, since the endpoint was removed.
	 */
	public function validate_request( \WP_REST_Request $request ) {
		unset( $request ); // Kept for backward compatibility.
		McpEndpointRemoval::doing_it_wrong( __METHOD__ );
		return self::get_removed_error();
	}

	/**
	 * Formerly returned the API key permissions of the current PooCommerce MCP request.
	 *
	 * @deprecated 11.3.0
	 *
	 * @return null Always null, since there is no PooCommerce MCP request.
	 */
	public static function get_current_user_permissions(): ?string {
		McpEndpointRemoval::doing_it_wrong( __METHOD__ );
		return null;
	}

	/**
	 * Formerly checked REST-derived ability permissions against the API key permissions.
	 *
	 * @deprecated 11.3.0
	 *
	 * @param bool   $allowed    Whether the operation is allowed.
	 * @param string $method     HTTP method. Ignored.
	 * @param object $controller REST controller instance. Ignored.
	 * @return bool The unchanged $allowed value.
	 */
	public function check_ability_permission( $allowed, $method, $controller ) {
		unset( $method, $controller ); // Kept for backward compatibility.
		McpEndpointRemoval::doing_it_wrong( __METHOD__ );
		return $allowed;
	}

	/**
	 * Get the error returned in place of the removed authentication.
	 *
	 * @return WP_Error
	 */
	private static function get_removed_error(): WP_Error {
		return new WP_Error(
			'poocommerce_mcp_removed',
			__( 'The PooCommerce MCP endpoint was removed.', 'poocommerce' ),
			array( 'status' => 410 )
		);
	}
}
