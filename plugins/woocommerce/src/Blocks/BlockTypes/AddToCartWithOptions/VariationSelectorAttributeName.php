<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Blocks\BlockTypes\AddToCartWithOptions;

use Automattic\PooCommerce\Blocks\BlockTypes\AbstractBlock;
use Automattic\PooCommerce\Blocks\BlockTypes\EnableBlockJsonAssetsTrait;
use Automattic\PooCommerce\Blocks\Utils\StyleAttributesUtils;

/**
 * Block type for variation selector attribute name in add to cart with options.
 * It's responsible to render the attribute name.
 */
class VariationSelectorAttributeName extends AbstractBlock {

	use EnableBlockJsonAssetsTrait;

	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'add-to-cart-with-options-variation-selector-attribute-name';

	/**
	 * Render the block.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content Block content.
	 * @param WP_Block $block Block instance.
	 * @return string Rendered block output.
	 */
	protected function render( $attributes, $content, $block ): string {
		if (
			! isset(
				$block->context['poocommerce/attributeId'],
				$block->context['poocommerce/attributeName']
			)
		) {
			return '';
		}

		$attribute_id   = $block->context['poocommerce/attributeId'];
		$attribute_name = $block->context['poocommerce/attributeName'];

		$classes_and_styles = StyleAttributesUtils::get_classes_and_styles_by_attributes( $attributes, array(), array( 'extra_classes' ) );

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => esc_attr( $classes_and_styles['classes'] ),
				'for'   => esc_attr( $attribute_id ),
				'id'    => esc_attr( $attribute_id . '_label' ),
				'style' => esc_attr( $classes_and_styles['styles'] ),
			)
		);

		$label_text = esc_html( wc_attribute_label( $attribute_name ) );

		return sprintf(
			'<label %s>%s</label>',
			$wrapper_attributes,
			$label_text
		);
	}
}
