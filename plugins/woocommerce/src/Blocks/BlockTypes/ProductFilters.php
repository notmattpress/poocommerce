<?php

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Blocks\BlockTypes;

use Automattic\PooCommerce\Blocks\Utils\BlocksSharedState;
use Automattic\PooCommerce\Internal\ProductFilters\Params;

/**
 * ProductFilters class.
 */
class ProductFilters extends AbstractBlock {
	use BlocksSharedState;

	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-filters';

	/**
	 * Register the context.
	 *
	 * @return string[]
	 */
	protected function get_block_type_uses_context() {
		return array( 'postId', 'query', 'queryId' );
	}

	/**
	 * Extra data passed through from server to client for block.
	 *
	 * @param array $attributes  Any attributes that currently are available from the block.
	 *                           Note, this will be empty in the editor context when the block is
	 *                           not in the post content on editor load.
	 */
	protected function enqueue_data( array $attributes = array() ) {
		global $pagenow;
		parent::enqueue_data( $attributes );

		$this->initialize_shared_config( 'I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of PooCommerce' );

		wp_interactivity_config(
			$this->get_full_block_name(),
			[
				'isProductArchive' => is_shop() || is_product_taxonomy() || ( is_search() && 'product' === get_post_type() ),
			]
		);
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
		wp_enqueue_script( 'wc-settings' );

		$query_id      = $block->context['queryId'] ?? 0;
		$filter_params = $this->get_filter_params( $query_id );

		wp_interactivity_config( $this->get_full_block_name(), [ 'canonicalUrl' => $this->get_canonical_url_no_pagination( $filter_params ) ] );

		/**
		 * Filter hook to modify the selected filter items.
		 *
		 * @since 9.7.0
		 */
		$active_filters = apply_filters( 'poocommerce_blocks_product_filters_selected_items', array(), $filter_params );

		usort(
			$active_filters,
			function ( $a, $b ) {
				return strnatcmp( $a['activeLabel'], $b['activeLabel'] );
			}
		);

		$block_context         = array_merge(
			$block->context,
			array(
				'filterParams'  => $filter_params,
				'activeFilters' => $active_filters,
			),
		);
		$inner_blocks          = array_reduce(
			$block->parsed_block['innerBlocks'],
			function ( $carry, $parsed_block ) use ( $block_context ) {
				$carry .= ( new \WP_Block( $parsed_block, $block_context ) )->render();
				return $carry;
			},
			''
		);
		$interactivity_context = array(
			'params'        => $filter_params,
			'activeFilters' => $active_filters,
		);

		$classes = '';
		$styles  = '';
		$tags    = new \WP_HTML_Tag_Processor( $content );

		if ( $tags->next_tag( array( 'class_name' => 'wc-block-product-filters' ) ) ) {
			$classes = $tags->get_attribute( 'class' );
			$styles  = $tags->get_attribute( 'style' );
		}

		$wrapper_attributes = array(
			'class'                            => $classes,
			'data-wp-interactive'              => $this->get_full_block_name(),
			'data-wp-watch--scrolling'         => 'callbacks.scrollLimit',
			'data-wp-on--keyup'                => 'actions.closeOverlayOnEscape',
			'data-wp-context'                  => wp_json_encode( $interactivity_context, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP ),
			'data-wp-class--is-overlay-opened' => 'context.isOverlayOpened',
			'style'                            => $styles,
		);

		// TODO: Remove this conditional once the fix is released in WP. https://github.com/poocommerce/gutenberg/pull/4.
		if ( ! isset( $block->context['productCollectionLocation'] ) ) {
			$wrapper_attributes['data-wp-router-region'] = $this->generate_navigation_id( $block );
		}

		ob_start();
		?>
		<div <?php echo get_block_wrapper_attributes( $wrapper_attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<button
				class="wc-block-product-filters__open-overlay"
				data-wp-on--click="actions.openOverlay"
			>
				<?php echo $this->get_svg_icon( 'filter-icon-2' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span><?php echo esc_html__( 'Filter products', 'poocommerce' ); ?></span>
			</button>
			<div class="wc-block-product-filters__overlay">
				<div class="wc-block-product-filters__overlay-wrapper">
					<div
						class="wc-block-product-filters__overlay-dialog"
						role="dialog"
						aria-label="<?php echo esc_html__( 'Product Filters', 'poocommerce' ); ?>"
					>
						<header class="wc-block-product-filters__overlay-header">
							<button
								class="wc-block-product-filters__close-overlay"
								data-wp-on--click="actions.closeOverlay"
							>
								<span><?php echo esc_html__( 'Close', 'poocommerce' ); ?></span>
								<?php echo $this->get_svg_icon( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							</button>
						</header>
						<div class="wc-block-product-filters__overlay-content">
							<?php echo $inner_blocks; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</div>
						<footer
							class="wc-block-product-filters__overlay-footer"
						>
							<button
								class="wc-block-product-filters__apply wp-element-button"
								data-wp-interactive="<?php echo esc_attr( $this->get_full_block_name() ); ?>"
								data-wp-on--click="actions.closeOverlay"
							>
								<span><?php echo esc_html__( 'Apply', 'poocommerce' ); ?></span>
							</button>
						</footer>
					</div>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get SVG icon markup for a given icon name.
	 *
	 * @param string $name The name of the icon to retrieve.
	 * @return string SVG markup for the icon, or empty string if icon not found.
	 */
	private function get_svg_icon( string $name ) {
		$icons = array(
			'close'         => '<path d="M12 13.0607L15.7123 16.773L16.773 15.7123L13.0607 12L16.773 8.28772L15.7123 7.22706L12 10.9394L8.28771 7.22705L7.22705 8.28771L10.9394 12L7.22706 15.7123L8.28772 16.773L12 13.0607Z" fill="currentColor"/>',
			'filter-icon-2' => '<path d="M10 17.5H14V16H10V17.5ZM6 6V7.5H18V6H6ZM8 12.5H16V11H8V12.5Z" fill="currentColor"/>',
		);

		if ( ! isset( $icons[ $name ] ) ) {
			return '';
		}

		return sprintf(
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">%s</svg>',
			$icons[ $name ]
		);
	}

	/**
	 * Generate a unique navigation ID for the block.
	 *
	 * @param mixed $block - Block instance.
	 * @return string - Unique navigation ID.
	 */
	private function generate_navigation_id( $block ) {
		return sprintf(
			'wc-product-filters-%s',
			md5( wp_json_encode( $block->parsed_block['innerBlocks'] ) )
		);
	}

	/**
	 * Parse the filter parameters from the URL.
	 * For now we only get the global query params from the URL. In the future,
	 * we should get the query params based on $query_id.
	 *
	 * @param int $query_id Query ID.
	 * @return array Parsed filter params.
	 */
	private function get_filter_params( $query_id ) {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '';

		$parsed_url = wp_parse_url( esc_url_raw( $request_uri ) );

		if ( empty( $parsed_url['query'] ) ) {
			return array();
		}

		parse_str( $parsed_url['query'], $url_query_params );

		$filter_param_keys = wc_get_container()->get( Params::class )->get_param_keys();

		return array_filter(
			$url_query_params,
			function ( $key ) use ( $filter_param_keys ) {
				return in_array( $key, $filter_param_keys, true );
			},
			ARRAY_FILTER_USE_KEY
		);
	}

	/**
	 * Disable the style handle for this block type. We use block.json to load the style.
	 *
	 * @return null
	 */
	protected function get_block_type_style() {
		return null;
	}

	/**
	 * Disable the editor style handle for this block type. We use block.json to load the style.
	 *
	 * @return null
	 */
	protected function get_block_type_editor_style() {
		return null;
	}

	/**
	 * Disable the script handle for this block type. We use block.json to load the script.
	 *
	 * @param string|null $key The key of the script to get.
	 * @return null
	 */
	protected function get_block_type_script( $key = null ) {
		return null;
	}

	/**
	 * Get the canonical URL without pagination.
	 *
	 * @param array $filter_params Filter parameters.
	 * @return string Canonical URL without pagination.
	 */
	private function get_canonical_url_no_pagination( $filter_params ) {
		$canonical_url_no_pagination = is_singular() ? get_permalink() : get_pagenum_link( 1 );
		$parsed_url                  = wp_parse_url( html_entity_decode( $canonical_url_no_pagination, ENT_QUOTES, get_bloginfo( 'charset' ) ) );

		// If there are active filters, $parsed_url['query'] is empty for page or post but not empty for archives.
		if ( empty( $filter_params ) || empty( $parsed_url['query'] ) ) {
			return $canonical_url_no_pagination;
		}

		foreach ( array_keys( $filter_params ) as $key ) {
			$parsed_url['query'] = remove_query_arg( $key, $parsed_url['query'] );
		}

		$url = '';

		if ( isset( $parsed_url['scheme'] ) ) {
			$url .= $parsed_url['scheme'] . '://';
		}

		if ( isset( $parsed_url['host'] ) ) {
			$url .= $parsed_url['host'];
		}

		if ( isset( $parsed_url['port'] ) ) {
			$url .= ':' . $parsed_url['port'];
		}

		if ( isset( $parsed_url['path'] ) ) {
			$url .= $parsed_url['path'];
		}

		if ( ! empty( $parsed_url['query'] ) ) {
			$url .= '?' . $parsed_url['query'];
		}

		if ( isset( $parsed_url['fragment'] ) ) {
			$url .= '#' . $parsed_url['fragment'];
		}

		return $url;
	}
}
