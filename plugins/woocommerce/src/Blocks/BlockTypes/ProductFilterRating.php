<?php

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Blocks\BlockTypes;

use Automattic\PooCommerce\Blocks\BlockTypes\ProductCollection\Utils as ProductCollectionUtils;
use Automattic\PooCommerce\Internal\ProductFilters\FilterDataProvider;
use Automattic\PooCommerce\Internal\ProductFilters\QueryClauses;

/**
 * Product Filter: Rating Block
 *
 * @package Automattic\PooCommerce\Blocks\BlockTypes
 */
final class ProductFilterRating extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-filter-rating';

	const RATING_FILTER_QUERY_VAR = 'rating_filter';

	/**
	 * Initialize this block type.
	 *
	 * - Hook into WP lifecycle.
	 * - Register the block with WordPress.
	 */
	protected function initialize() {
		parent::initialize();

		add_filter( 'poocommerce_blocks_product_filters_selected_items', array( $this, 'prepare_selected_filters' ), 10, 2 );
	}



	/**
	 * Prepare the active filter items.
	 *
	 * @param array $items  The active filter items.
	 * @param array $params The query param parsed from the URL.
	 * @return array Active filters items.
	 */
	public function prepare_selected_filters( $items, $params ) {
		if ( empty( $params[ self::RATING_FILTER_QUERY_VAR ] ) ) {
			return $items;
		}

		$active_ratings = array_map( 'absint', explode( ',', $params[ self::RATING_FILTER_QUERY_VAR ] ) );
		$active_ratings = array_filter(
			$active_ratings,
			function ( $rating ) {
				return $rating > 0 && $rating < 6;
			}
		);
		$active_ratings = array_unique( $active_ratings );

		if ( empty( $active_ratings ) ) {
			return $items;
		}

		foreach ( $active_ratings as $rating ) {
			$items[] = array(
				'type'        => 'rating',
				'value'       => (string) $rating,
				/* translators: %s is referring to rating value. Example: Rated 4 out of 5. */
				'activeLabel' => sprintf( __( 'Rating: Rated %d out of 5', 'poocommerce' ), $rating ),
			);
		}

		return $items;
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
		// don't render if its admin, or ajax in progress.
		if ( is_admin() || wp_doing_ajax() ) {
			return '';
		}

		$min_rating    = $attributes['minRating'] ?? 0;
		$rating_counts = $this->get_rating_counts( $block );
		// User selected minimum rating to display.
		$rating_counts_with_min = array_filter(
			$rating_counts,
			function ( $rating ) use ( $min_rating ) {
				return $rating['rating'] >= $min_rating & $rating['rating'] < 6;
			}
		);
		$filter_params          = $block->context['filterParams'] ?? array();
		$rating_query           = $filter_params[ self::RATING_FILTER_QUERY_VAR ] ?? '';
		$selected_rating        = array_filter( array_map( 'absint', explode( ',', $rating_query ) ) );

		$filter_options = array_map(
			function ( $rating ) use ( $selected_rating ) {
				$aria_label = sprintf(
					/* translators: %1$d is referring to rating value. Example: Rated 4 out of 5. */
					__( 'Rated %1$d out of 5', 'poocommerce' ),
					$rating['rating'],
				);

				return array(
					'label'     => $this->render_rating_label( (int) $rating['rating'] ),
					'ariaLabel' => $aria_label,
					'value'     => (string) $rating['rating'],
					'selected'  => in_array( $rating['rating'], $selected_rating, true ),
					'count'     => $rating['count'],
					'type'      => 'rating',
				);
			},
			$rating_counts_with_min
		);

		$filter_context = array(
			'items'      => $filter_options,
			'showCounts' => $attributes['showCounts'] ?? false,
			'groupLabel' => __( 'Rating', 'poocommerce' ),
		);

		$wrapper_attributes = array(
			'data-wp-interactive' => 'poocommerce/product-filters',
			'data-wp-key'         => wp_unique_prefixed_id( $this->get_full_block_name() ),
			'data-wp-context'     => wp_json_encode(
				array(
					/* translators: {{label}} is the rating filter item label. */
					'activeLabelTemplate' => __( 'Rating: {{label}}', 'poocommerce' ),
					'filterType'          => 'rating',
				),
				JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
			),
		);

		if ( empty( $filter_options ) ) {
			$wrapper_attributes['hidden'] = true;
			$wrapper_attributes['class']  = 'wc-block-product-filter--hidden';
		}

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
	 * Render the rating label.
	 *
	 * @param int $rating The rating to render.
	 * @return string|false
	 */
	private function render_rating_label( $rating ) {
		$view_box_width = $rating * 24;

		$rating_label = sprintf(
			/* translators: %1$d is referring to rating value. Example: Rated 4 out of 5. */
			__( 'Rated %1$d out of 5', 'poocommerce' ),
			$rating,
		);

		ob_start();
		?>
			<svg
				width="<?php echo esc_attr( $view_box_width ); ?>"
				height="24"
				viewBox="0 0 <?php echo esc_attr( $view_box_width ); ?> 24"
				fill="currentColor"
				aria-label="<?php echo esc_attr( $rating_label ); ?>"
			>
				<?php
				for ( $i = 0; $i < $rating; $i++ ) {
					?>
					<path
						d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
						transform="translate(<?php echo esc_attr( $i * 24 ); ?>, 0)"
					/>
					<?php
				}
				?>
			</svg>
		<?php
		return ob_get_clean();
	}

	/**
	 * Retrieve the rating filter data for current block.
	 *
	 * @param WP_Block $block Block instance.
	 */
	private function get_rating_counts( $block ) {
		if ( ! isset( $block->context['filterParams'] ) ) {
			return array();
		}

		$query_vars = ProductCollectionUtils::get_query_vars( $block, 1 );

		if ( ! empty( $query_vars['tax_query'] ) ) {
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			$query_vars['tax_query'] = ProductCollectionUtils::remove_query_array( $query_vars['tax_query'], 'rating_filter', true );
		}

		if ( isset( $query_vars['taxonomy'] ) && false !== strpos( $query_vars['taxonomy'], 'pa_' ) ) {
			unset(
				$query_vars['taxonomy'],
				$query_vars['term']
			);
		}

		$container = wc_get_container();
		$counts    = $container->get( FilterDataProvider::class )->with( $container->get( QueryClauses::class ) )->get_rating_counts( $query_vars );
		$data      = array();

		foreach ( $counts as $key => $value ) {
			$data[] = array(
				'rating' => $key,
				'count'  => intval( $value ),
			);
		}

		return $data;
	}

	/**
	 * Disable the editor style handle for this block type.
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
}
