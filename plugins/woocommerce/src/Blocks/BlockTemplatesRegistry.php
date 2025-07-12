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
use Automattic\PooCommerce\Blocks\Templates\ProductBrandTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductCatalogTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductCategoryTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductTagTemplate;
use Automattic\PooCommerce\Blocks\Templates\ProductSearchResultsTemplate;
use Automattic\PooCommerce\Blocks\Templates\SingleProductTemplate;
use Automattic\PooCommerce\Blocks\Templates\SimpleProductAddToCartWithOptionsTemplate;
use Automattic\PooCommerce\Blocks\Templates\ExternalProductAddToCartWithOptionsTemplate;
use Automattic\PooCommerce\Blocks\Templates\VariableProductAddToCartWithOptionsTemplate;
use Automattic\PooCommerce\Blocks\Templates\GroupedProductAddToCartWithOptionsTemplate;
use Automattic\PooCommerce\Enums\ProductType;

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
				ProductBrandTemplate::SLUG         => new ProductBrandTemplate(),
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
			if ( wp_is_block_theme() ) {
				$product_types = wc_get_product_types();
				if ( count( $product_types ) > 0 ) {
					add_filter( 'default_wp_template_part_areas', array( $this, 'register_add_to_cart_with_options_template_part_area' ), 10, 1 );
					if ( array_key_exists( ProductType::SIMPLE, $product_types ) ) {
						$template_parts[ SimpleProductAddToCartWithOptionsTemplate::SLUG ] = new SimpleProductAddToCartWithOptionsTemplate();
					}
					if ( array_key_exists( ProductType::EXTERNAL, $product_types ) ) {
						$template_parts[ ExternalProductAddToCartWithOptionsTemplate::SLUG ] = new ExternalProductAddToCartWithOptionsTemplate();
					}
					if ( array_key_exists( ProductType::VARIABLE, $product_types ) ) {
						$template_parts[ VariableProductAddToCartWithOptionsTemplate::SLUG ] = new VariableProductAddToCartWithOptionsTemplate();
					}
					if ( array_key_exists( ProductType::GROUPED, $product_types ) ) {
						$template_parts[ GroupedProductAddToCartWithOptionsTemplate::SLUG ] = new GroupedProductAddToCartWithOptionsTemplate();
					}
				}
			}
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
	 * Add Add to Cart + Options to the default template part areas.
	 *
	 * @param array $default_area_definitions An array of supported area objects.
	 * @return array The supported template part areas including the Add to Cart + Options one.
	 */
	public function register_add_to_cart_with_options_template_part_area( $default_area_definitions ) {
		$add_to_cart_with_options_template_part_area = array(
			'area'        => 'add-to-cart-with-options',
			'label'       => __( 'Add to Cart + Options', 'poocommerce' ),
			'description' => __( 'The Add to Cart + Options templates allow defining a different layout for each product type.', 'poocommerce' ),
			'icon'        => 'add-to-cart-with-options',
			'area_tag'    => 'add-to-cart-with-options',
		);
		return array_merge( $default_area_definitions, array( $add_to_cart_with_options_template_part_area ) );
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
