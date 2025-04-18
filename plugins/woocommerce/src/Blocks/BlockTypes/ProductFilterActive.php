<?php

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Blocks\BlockTypes;

/**
 * Product Filter: Active Block.
 */
final class ProductFilterActive extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-filter-active';

	/**
	 * Render the block.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block content.
	 * @param WP_Block $block      Block instance.
	 * @return string Rendered block type output.
	 */
	protected function render( $attributes, $content, $block ) {
		if ( ! isset( $block->context['activeFilters'] ) ) {
			return $content;
		}

		wp_enqueue_script_module( $this->get_full_block_name() );

		$active_filters = $block->context['activeFilters'];

		$filter_context = array(
			'items' => $active_filters,
		);

		$wrapper_attributes = array(
			'data-wp-interactive'  => 'poocommerce/product-filters',
			'data-wp-key'          => wp_unique_prefixed_id( $this->get_full_block_name() ),
			'data-wp-context'      => wp_json_encode(
				array(
					'filterType' => 'active',
				),
				JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
			),
			'data-wp-bind--hidden' => '!state.hasActiveFilters',
		);

		if ( empty( $active_filters ) ) {
			$wrapper_attributes['hidden'] = true;
		}

		wp_interactivity_config(
			'poocommerce/product-filters',
			array(
				/* translators:  {{label}} is the label of the active filter item. */
				'removeLabelTemplate' => __( 'Remove filter: {{label}}', 'poocommerce' ),
			)
		);

		return sprintf(
			'<div %1$s>%2$s</div>',
			get_block_wrapper_attributes( $wrapper_attributes ),
			array_reduce(
				$block->parsed_block['innerBlocks'],
				function ( $carry, $parsed_block ) use ( $filter_context ) {
					$carry .= ( new \WP_Block( $parsed_block, array( 'filterData' => $filter_context ) ) )->render();
					return $carry;
				},
				''
			)
		);
	}

	/**
	 * Get the frontend style handle for this block type.
	 *
	 * @return null
	 */
	protected function get_block_type_style() {
		return null;
	}

	/**
	 * Disable the block type script, this uses script modules.
	 *
	 * @param string|null $key The key.
	 *
	 * @return null
	 */
	protected function get_block_type_script( $key = null ) {
		return null;
	}
}
