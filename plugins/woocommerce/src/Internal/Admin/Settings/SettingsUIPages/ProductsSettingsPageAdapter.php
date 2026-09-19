<?php
/**
 * Products settings adapter for settings UI.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Admin\Settings\SettingsUIPages;

use Automattic\PooCommerce\Admin\Settings\LegacySettingsPageAdapter;

defined( 'ABSPATH' ) || exit;

/**
 * Adapts the PooCommerce Products settings page for the settings UI renderer.
 *
 * @since 10.9.0
 */
final class ProductsSettingsPageAdapter extends LegacySettingsPageAdapter {

	/**
	 * Build the canonical settings schema for a section.
	 *
	 * @param string $section Section id. Empty string means the default section.
	 * @return array
	 */
	public function get_schema( string $section ): array {
		$schema = parent::get_schema( $section );

		$schema['shell']['title'] = __( 'Product settings', 'poocommerce' );

		return $schema;
	}
}
