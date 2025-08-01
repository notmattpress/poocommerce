<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Blocks\BlockTypes\AddToCartWithOptions;

use Automattic\PooCommerce\Blocks\BlockTypes\AbstractBlock;
use Automattic\PooCommerce\Blocks\BlockTypes\EnableBlockJsonAssetsTrait;
use Automattic\PooCommerce\Blocks\Utils\StyleAttributesUtils;

/**
 * Block type for variation selector attribute options in add to cart with options.
 * It's responsible to render the attribute options.
 */
class VariationSelectorAttributeOptions extends AbstractBlock {

	use EnableBlockJsonAssetsTrait;

	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'add-to-cart-with-options-variation-selector-attribute-options';

	/**
	 * Get the block's attributes.
	 *
	 * @param array $attributes Block attributes. Default empty array.
	 * @return array  Block attributes merged with defaults.
	 */
	private function parse_attributes( $attributes ) {
		// These should match what's set in JS `registerBlockType`.
		$defaults = array(
			'style' => 'pills',
		);

		return wp_parse_args( $attributes, $defaults );
	}

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
				$block->context['poocommerce/attributeName'],
				$block->context['poocommerce/attributeId'],
				$block->context['poocommerce/attributeTerms']
			)
		) {
			return '';
		}

		$attribute_slug = wc_variation_attribute_name( $block->context['poocommerce/attributeName'] );

		if ( isset( $attribute_slug ) ) {

			$attributes = $this->parse_attributes( $attributes );

			$classes_and_styles = StyleAttributesUtils::get_classes_and_styles_by_attributes( $attributes, array(), array( 'extra_classes' ) );

			$field_style = $attributes['style'];

			$wrapper_attributes = get_block_wrapper_attributes(
				array(
					'class' => esc_attr( $classes_and_styles['classes'] ),
					'style' => esc_attr( $classes_and_styles['styles'] ),
				)
			);

			if ( 'dropdown' === $field_style ) {
				$content = $this->render_dropdown( $attributes, $content, $block );
			} else {
				$content = $this->render_pills( $attributes, $content, $block );
			}

			return sprintf(
				'<div %s>%s</div>',
				$wrapper_attributes,
				$content
			);
		}

		return '';
	}

	/**
	 * Get the normalized version of the attributes.
	 *
	 * @param array $attributes         The element's attributes.
	 * @param array $default_attributes The element's default attributes.
	 * @return string The HTML element's attributes.
	 */
	public static function get_normalized_attributes( $attributes, $default_attributes = array() ) {
		$normalized_attributes = array();

		$merged_attributes = array_merge( $default_attributes, $attributes );

		foreach ( $merged_attributes as $key => $value ) {
			if ( is_null( $value ) ) {
				continue;
			}
			if ( is_array( $value ) || is_object( $value ) ) {
				$value = wp_json_encode(
					$value,
					JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
				);
			}
			$normalized_attributes[] = sprintf( '%s="%s"', esc_attr( $key ), esc_attr( $value ) );
		}

		return implode( ' ', $normalized_attributes );
	}

	/**
	 * Get the default selected attribute.
	 *
	 * @param array $attribute_terms The attribute's.
	 * @return string|null The default selected attribute.
	 */
	protected function get_default_selected_attribute( $attribute_terms ) {
		foreach ( $attribute_terms as $attribute_term ) {
			if ( $attribute_term['isSelected'] ) {
				return $attribute_term['value'];
			}
		}

		return null;
	}

	/**
	 * Render the attribute options as pills.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content Block content.
	 * @param WP_Block $block Block instance.
	 * @return string The pills.
	 */
	protected function render_pills( $attributes, $content, $block ) {
		$attribute_id    = $block->context['poocommerce/attributeId'];
		$attribute_slug  = wc_variation_attribute_name( $block->context['poocommerce/attributeName'] );
		$attribute_terms = $block->context['poocommerce/attributeTerms'];

		$pills = '';
		foreach ( $attribute_terms as $attribute_term ) {
			$input = sprintf(
				'<input type="radio" %s/>',
				$this->get_normalized_attributes(
					array(
						'class'                  => 'wc-block-add-to-cart-with-options-variation-selector-attribute-options__pill-input',
						'name'                   => $attribute_slug,
						'value'                  => $attribute_term['value'],
						'data-wp-bind--checked'  => 'state.isOptionSelected',
						'data-wp-bind--disabled' => 'state.isOptionDisabled',
						'data-wp-watch'          => 'callbacks.watchSelected',
						'data-wp-on--click'      => 'actions.handlePillClick',
						'data-wp-on--keydown'    => 'actions.handleKeyDown',
						'data-wp-context'        => array(
							'option' => $attribute_term,
						),
					),
				),
				$attribute_term['label']
			);

			$pills .= '<label class="wc-block-add-to-cart-with-options-variation-selector-attribute-options__pill">' . $input . $attribute_term['label'] . '</label>';
		}

		return sprintf(
			'<div %s>%s</div>',
			$this->get_normalized_attributes(
				array(
					'class'           => 'wc-block-add-to-cart-with-options-variation-selector-attribute-options__pills',
					'role'            => 'radiogroup',
					'id'              => $attribute_id,
					'aria-labelledby' => $attribute_id . '_label',
					'data-wp-context' => array(
						'name'          => $attribute_slug,
						'options'       => $attribute_terms,
						'selectedValue' => $this->get_default_selected_attribute( $attribute_terms ),
						'focused'       => '',
					),
					'data-wp-init'    => 'callbacks.setDefaultSelectedAttribute',
					'data-wp-watch'   => 'callbacks.setSelectedVariationId',
				),
			),
			$pills,
		);
	}

	/**
	 * Render the attribute options as a dropdown.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content Block content.
	 * @param WP_Block $block Block instance.
	 * @return string The dropdown.
	 */
	protected function render_dropdown( $attributes, $content, $block ) {
		$attribute_id    = $block->context['poocommerce/attributeId'];
		$attribute_slug  = wc_variation_attribute_name( $block->context['poocommerce/attributeName'] );
		$attribute_terms = $block->context['poocommerce/attributeTerms'];
		$default_option  = array(
			'label'      => esc_html__( 'Choose an option', 'poocommerce' ),
			'value'      => '',
			'isSelected' => false,
		);

		$attribute_terms = array_merge(
			array( $default_option ),
			$attribute_terms
		);

		$options = '';
		foreach ( $attribute_terms as $attribute_term ) {
			$option_attributes = array(
				'value'                  => $attribute_term['value'],
				'data-wp-bind--disabled' => 'state.isOptionDisabled',
				'data-wp-context'        => array(
					'option'  => $attribute_term,
					'name'    => $attribute_slug,
					'options' => $attribute_terms,
				),
			);

			if ( $attribute_term['isSelected'] ) {
				$option_attributes['selected'] = 'selected';
			}

			$options .= sprintf(
				'<option %s>%s</option>',
				$this->get_normalized_attributes(
					$option_attributes
				),
				$attribute_term['label']
			);
		}

		return sprintf(
			'<select %s>%s</select>',
			$this->get_normalized_attributes(
				array(
					'class'              => 'wc-block-add-to-cart-with-options-variation-selector-attribute-options__dropdown',
					'id'                 => $attribute_id,
					'data-wp-context'    => array(
						'name'          => $attribute_slug,
						'options'       => $attribute_terms,
						'selectedValue' => $this->get_default_selected_attribute( $attribute_terms ),
					),
					'data-wp-init'       => 'callbacks.setDefaultSelectedAttribute',
					'data-wp-watch'      => 'callbacks.setSelectedVariationId',
					'data-wp-on--change' => 'actions.handleDropdownChange',
					'name'               => $attribute_slug,
				),
			),
			$options,
		);
	}
}
