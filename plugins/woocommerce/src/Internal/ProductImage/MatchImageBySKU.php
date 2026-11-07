<?php
/**
 * MatchImageBySKU class file.
 */

namespace Automattic\PooCommerce\Internal\ProductImage;

defined( 'ABSPATH' ) || exit;

/**
 * Class for the product image matching by SKU.
 */
class MatchImageBySKU {

	/**
	 * The name of the setting for this feature.
	 *
	 * @var string
	 */
	private $setting_name = 'poocommerce_product_match_featured_image_by_sku';

	/**
	 * MatchImageBySKU constructor.
	 */
	public function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize the hooks used by the class.
	 */
	private function init_hooks() {
		add_filter( 'poocommerce_get_settings_products', array( $this, 'add_product_image_sku_setting' ), 110, 2 );
	}

	/**
	 * Is this feature enabled.
	 *
	 * @since 8.3.0
	 * @return bool
	 */
	public function is_enabled() {
		return wc_string_to_bool( get_option( $this->setting_name ) );
	}

	/**
	 * Handler for 'poocommerce_get_settings_products', adds the settings related to the product image SKU matching table.
	 *
	 * @param array  $settings Original settings configuration array.
	 * @param string $section_id Settings section identifier.
	 * @return array New settings configuration array.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function add_product_image_sku_setting( array $settings, string $section_id ): array {
		if ( 'advanced' !== $section_id ) {
			return $settings;
		}

		$settings[] = array(
			'title' => __( 'Product image matching by SKU', 'poocommerce' ),
			'type'  => 'title',
		);

		$settings[] = array(
			'title'         => __( 'Match images', 'poocommerce' ),
			'desc'          => __( 'Set product featured image when uploaded image file name matches product SKU.', 'poocommerce' ),
			'id'            => $this->setting_name,
			'default'       => 'no',
			'type'          => 'checkbox',
			'checkboxgroup' => 'start',
		);

		$settings[] = array( 'type' => 'sectionend' );

		return $settings;
	}
}
