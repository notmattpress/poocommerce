<?php
/**
 * REST Ability Factory class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Abilities\REST;

use Automattic\PooCommerce\Internal\MCP\McpEndpointRemoval;

defined( 'ABSPATH' ) || exit;

/**
 * Formerly created abilities from PooCommerce REST controllers for the PooCommerce MCP endpoint.
 *
 * Kept so existing callers don't fatal. The methods do nothing except report incorrect usage.
 *
 * @deprecated 11.3.0 Removed along with the PooCommerce MCP endpoint. Use the PooCommerce abilities registered through the WordPress Abilities API.
 */
class RestAbilityFactory {

	/**
	 * Metadata key that marked abilities for the removed PooCommerce MCP endpoint. PooCommerce no longer reads it.
	 *
	 * @deprecated 11.3.0
	 */
	public const EXPOSE_IN_DEPRECATED_MCP_META_KEY = 'expose_in_deprecated_poocommerce_mcp';

	/**
	 * Formerly registered abilities for a REST controller.
	 *
	 * @deprecated 11.3.0
	 *
	 * @param array $config Controller configuration. Ignored.
	 */
	public static function register_controller_abilities( array $config ): void {
		unset( $config ); // Kept for backward compatibility.
		McpEndpointRemoval::doing_it_wrong( __METHOD__ );
	}
}
