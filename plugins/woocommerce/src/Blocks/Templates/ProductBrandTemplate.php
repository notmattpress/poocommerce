<?php
declare( strict_types = 1 );
namespace Automattic\PooCommerce\Blocks\Templates;

use Automattic\PooCommerce\Blocks\Templates\ArchiveProductTemplatesCompatibility;
use Automattic\PooCommerce\Blocks\Utils\BlockTemplateUtils;

/**
 * ProductBrandTemplate class.
 *
 * @internal
 */
class ProductBrandTemplate extends AbstractTemplate {

	/**
	 * The slug of the template.
	 *
	 * @var string
	 */
	const SLUG = 'taxonomy-product_brand';

	/**
	 * The template used as a fallback if that one is customized.
	 *
	 * @var string
	 */
	public $fallback_template = ProductCatalogTemplate::SLUG;

	/**
	 * Initialization method.
	 */
	public function init() {
		add_action( 'template_redirect', array( $this, 'render_block_template' ) );
	}

	/**
	 * Returns the title of the template.
	 *
	 * @return string
	 */
	public function get_template_title() {
		return _x( 'Products by Brand', 'Template name', 'poocommerce' );
	}

	/**
	 * Returns the description of the template.
	 *
	 * @return string
	 */
	public function get_template_description() {
		return __( 'Displays products filtered by a brand.', 'poocommerce' );
	}

	/**
	 * Renders the default block template from Woo Blocks if no theme templates exist.
	 */
	public function render_block_template() {
		if ( ! is_embed() && is_product_taxonomy() && is_tax( 'product_brand' ) ) {
			$compatibility_layer = new ArchiveProductTemplatesCompatibility();
			$compatibility_layer->init();

			$templates = get_block_templates( array( 'slug__in' => array( self::SLUG ) ) );

			if ( isset( $templates[0] ) && BlockTemplateUtils::template_has_legacy_template_block( $templates[0] ) ) {
				add_filter( 'poocommerce_disable_compatibility_layer', '__return_true' );
			}

			add_filter( 'poocommerce_has_block_template', '__return_true', 10, 0 );
		}
	}
}
