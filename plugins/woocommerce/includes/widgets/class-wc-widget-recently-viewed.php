<?php
/**
 * Recent Products Widget.
 *
 * @package PooCommerce\Widgets
 * @version 3.3.0
 */

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Enums\ProductStockStatus;

/**
 * Widget recently viewed.
 */
class WC_Widget_Recently_Viewed extends WC_Widget {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->widget_cssclass    = 'poocommerce widget_recently_viewed_products';
		$this->widget_description = __( "Display a list of a customer's recently viewed products.", 'poocommerce' );
		$this->widget_id          = 'poocommerce_recently_viewed_products';
		$this->widget_name        = __( 'Recently Viewed Products list', 'poocommerce' );
		$this->settings           = array(
			'title'  => array(
				'type'  => 'text',
				'std'   => __( 'Recently Viewed Products', 'poocommerce' ),
				'label' => __( 'Title', 'poocommerce' ),
			),
			'number' => array(
				'type'  => 'number',
				'step'  => 1,
				'min'   => 1,
				'max'   => 15,
				'std'   => 10,
				'label' => __( 'Number of products to show', 'poocommerce' ),
			),
		);

		parent::__construct();
	}

	/**
	 * Output widget.
	 *
	 * @see WP_Widget
	 * @param array $args     Arguments.
	 * @param array $instance Widget instance.
	 */
	public function widget( $args, $instance ) {
		$viewed_products = ! empty( $_COOKIE['poocommerce_recently_viewed'] ) ? (array) explode( '|', wp_unslash( $_COOKIE['poocommerce_recently_viewed'] ) ) : array(); // @codingStandardsIgnoreLine
		$viewed_products = array_reverse( array_filter( array_map( 'absint', $viewed_products ) ) );

		if ( empty( $viewed_products ) ) {
			return;
		}

		ob_start();

		$number = ! empty( $instance['number'] ) ? absint( $instance['number'] ) : $this->settings['number']['std'];

		$query_args = array(
			'posts_per_page' => $number,
			'no_found_rows'  => 1,
			'post_status'    => 'publish',
			'post_type'      => 'product',
			'post__in'       => $viewed_products,
			'orderby'        => 'post__in',
		);

		if ( 'yes' === get_option( 'poocommerce_hide_out_of_stock_items' ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => ProductStockStatus::OUT_OF_STOCK,
					'operator' => 'NOT IN',
				),
			); // WPCS: slow query ok.
		}

		$r = new WP_Query( apply_filters( 'poocommerce_recently_viewed_products_widget_query_args', $query_args ) );

		if ( $r->have_posts() ) {

			$this->widget_start( $args, $instance );

			echo wp_kses_post( apply_filters( 'poocommerce_before_widget_product_list', '<ul class="product_list_widget">' ) );

			$template_args = array(
				'widget_id' => isset( $args['widget_id'] ) ? $args['widget_id'] : $this->widget_id,
			);

			while ( $r->have_posts() ) {
				$r->the_post();
				wc_get_template( 'content-widget-product.php', $template_args );
			}

			echo wp_kses_post( apply_filters( 'poocommerce_after_widget_product_list', '</ul>' ) );

			$this->widget_end( $args );
		}

		wp_reset_postdata();

		$content = ob_get_clean();

		echo $content; // WPCS: XSS ok.
	}
}
