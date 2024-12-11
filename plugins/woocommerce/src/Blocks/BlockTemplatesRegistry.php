<?php
namespace Automattic\PooCommerce\Blocks;

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Blocks\Utils\BlockTemplateUtils;
use Automattic\PooCommerce\Blocks\Templates\AbstractTemplate;
use Automattic\PooCommerce\Blocks\Templates\AbstractTemplatePart;
use Automattic\PooCommerce\Blocks\Templates\MiniCartTemplate;
use Automattic\PooCommerce\Blocks\Templates\CartTemplate;
use Automattic\PooCommerce\Blocks\Templates\CheckoutTemplate;
use Automattic\PooCommerce\Blocks\Templates\CheckoutHeaderTemplate;
use Automattic\PooCommerce\Blocks\Templates\ComingSoonTemplate;
use Automattic\PooCommerce\Blocks\Templates\OrderConfirmationTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductAttributeTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductCatalogTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductCategoryTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductTagTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductSearchResultsTemplate;
use Automattic\PooCommerce\Blocks\Templates\SingleProductTemplate;

/**
 * BlockTemplatesRegistry class.
 *
 * @internal
 */
class BlockTemplatesRegistry {

	/**
	 * The array of registered templates.
	 *
	 * @var AbstractTemplate[]|AbstractTemplatePart[]
	 */
	private $templates = array();

	/**
	 * Initialization method.
	 */
	public function init() {
		if ( BlockTemplateUtils::supports_block_templates( 'wp_template' ) ) {
			$templates = array(
				ProductCatalogTemplate::SLUG       => new ProductCatalogTemplate(),
				ProductCategoryTemplate::SLUG      => new ProductCategoryTemplate(),
				ProductTagTemplate::SLUG           => new ProductTagTemplate(),
				ProductAttributeTemplate::SLUG     => new ProductAttributeTemplate(),
				ProductSearchResultsTemplate::SLUG => new ProductSearchResultsTemplate(),
				CartTemplate::SLUG                 => new CartTemplate(),
				CheckoutTemplate::SLUG             => new CheckoutTemplate(),
				OrderConfirmationTemplate::SLUG    => new OrderConfirmationTemplate(),
				SingleProductTemplate::SLUG        => new SingleProductTemplate(),
			);
		} else {
			$templates = array();
		}
		if ( Features::is_enabled( 'launch-your-store' ) ) {
			$templates[ ComingSoonTemplate::SLUG ] = new ComingSoonTemplate();
		}
		if ( BlockTemplateUtils::supports_block_templates( 'wp_template_part' ) ) {
			$template_parts = array(
				MiniCartTemplate::SLUG       => new MiniCartTemplate(),
				CheckoutHeaderTemplate::SLUG => new CheckoutHeaderTemplate(),
			);
		} else {
			$template_parts = array();
		}
		$this->templates = array_merge( $templates, $template_parts );

		// Init all templates.
		foreach ( $this->templates as $template ) {
			$template->init();
		}
	}

	/**
	 * Returns the template matching the slug
	 *
	 * @param string $template_slug Slug of the template to retrieve.
	 *
	 * @return AbstractTemplate|AbstractTemplatePart|null
	 */
	public function get_template( $template_slug ) {
		if ( array_key_exists( $template_slug, $this->templates ) ) {
			$registered_template = $this->templates[ $template_slug ];
			return $registered_template;
		}
		return null;
	}
}
