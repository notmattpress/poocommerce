<?php
namespace Automattic\PooCommerce\Blocks\BlockTypes;

use Automattic\PooCommerce\Blocks\Utils\BlocksSharedState;
use Automattic\PooCommerce\Blocks\Utils\StyleAttributesUtils;

/**
 * ProductPrice class.
 */
class ProductPrice extends AbstractBlock {

	use EnableBlockJsonAssetsTrait;
	use BlocksSharedState;


	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-price';

	/**
	 * API version name.
	 *
	 * @var string
	 */
	protected $api_version = '3';

	/**
	 * Get the frontend style handle for this block type.
	 *
	 * @return null
	 */
	protected function get_block_type_style() {
		return null;
	}

	/**
	 * Overwrite parent method to prevent script registration.
	 *
	 * It is necessary to register and enqueues assets during the render
	 * phase because we want to load assets only if the block has the content.
	 */
	protected function register_block_type_assets() {
		return null;
	}

	/**
	 * Register the context.
	 */
	protected function get_block_type_uses_context() {
		return [ 'query', 'queryId', 'postId' ];
	}

	/**
	 * Include and render the block.
	 *
	 * @param array    $attributes Block attributes. Default empty array.
	 * @param string   $content    Block content. Default empty string.
	 * @param WP_Block $block      Block instance.
	 * @return string Rendered block type output.
	 */
	protected function render( $attributes, $content, $block ) {
		if ( ! empty( $content ) ) {
			parent::register_block_type_assets();
			$this->register_chunk_translations( [ $this->block_name ] );
			return $content;
		}

		$post_id = isset( $block->context['postId'] ) ? $block->context['postId'] : '';
		$product = wc_get_product( $post_id );

		if ( $product ) {
			$styles_and_classes            = StyleAttributesUtils::get_classes_and_styles_by_attributes( $attributes );
			$text_align_styles_and_classes = StyleAttributesUtils::get_text_align_class_and_style( $attributes );

			$is_descendant_of_product_collection       = isset( $block->context['query']['isProductCollectionBlock'] );
			$is_descendant_of_grouped_product_selector = isset( $block->context['isDescendantOfGroupedProductSelector'] );
			$is_interactive                            = ! $is_descendant_of_product_collection && ! $is_descendant_of_grouped_product_selector && $product->is_type( 'variable' );

			$wrapper_attributes = array();
			$watch_attribute    = '';

			if ( $is_interactive ) {
				$variations_data           = $product->get_available_variations();
				$formatted_variations_data = array();
				foreach ( $variations_data as $variation ) {
					if ( ! isset( $variation['variation_id'] ) || ! isset( $variation['price_html'] ) ) {
							continue;
					}
					$formatted_variations_data[ $variation['variation_id'] ] = array(
						'price_html' => $variation['price_html'],
					);
				}

				wp_interactivity_state(
					'poocommerce',
					array(
						'products' => array(
							$product->get_id() => array(
								'price_html' => $product->get_price_html(),
								'variations' => $formatted_variations_data,
							),
						),
					)
				);

				wp_enqueue_script_module( 'poocommerce/product-elements' );
				$wrapper_attributes['data-wp-interactive'] = 'poocommerce/product-elements';
				$context                                   = array(
					'productElementKey' => 'price_html',
				);
				$wrapper_attributes['data-wp-context']     = wp_json_encode( $context, JSON_NUMERIC_CHECK | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP );
				$watch_attribute                           = 'data-wp-watch="callbacks.updateValue"';
			}

			return sprintf(
				'<div %1$s><div class="wc-block-components-product-price wc-block-grid__product-price %2$s %3$s" style="%4$s" %5$s>
					%6$s
				</div></div>',
				get_block_wrapper_attributes( $wrapper_attributes ),
				esc_attr( $text_align_styles_and_classes['class'] ?? '' ),
				esc_attr( $styles_and_classes['classes'] ),
				esc_attr( $styles_and_classes['styles'] ?? '' ),
				$watch_attribute,
				$product->get_price_html()
			);
		}
	}
}
