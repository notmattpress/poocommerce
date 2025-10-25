<?php
/**
 * Recent Reviews Widget.
 *
 * @package PooCommerce\Widgets
 * @version 2.3.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Widget recent reviews class.
 */
class WC_Widget_Recent_Reviews extends WC_Widget {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->widget_cssclass    = 'poocommerce widget_recent_reviews';
		$this->widget_description = __( 'Display a list of recent reviews from your store.', 'poocommerce' );
		$this->widget_id          = 'poocommerce_recent_reviews';
		$this->widget_name        = __( 'Recent Product Reviews', 'poocommerce' );
		$this->settings           = array(
			'title'  => array(
				'type'  => 'text',
				'std'   => __( 'Recent reviews', 'poocommerce' ),
				'label' => __( 'Title', 'poocommerce' ),
			),
			'number' => array(
				'type'  => 'number',
				'step'  => 1,
				'min'   => 1,
				'max'   => '',
				'std'   => 10,
				'label' => __( 'Number of reviews to show', 'poocommerce' ),
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
		global $comments, $comment;

		if ( $this->get_cached_widget( $args ) ) {
			return;
		}

		ob_start();

		$number   = ! empty( $instance['number'] ) ? absint( $instance['number'] ) : $this->settings['number']['std'];
		$comments = get_comments(
			array(
				'number'      => $number,
				'status'      => 'approve',
				'post_status' => 'publish',
				'post_type'   => 'product',
				'parent'      => 0,
			)
		); // WPCS: override ok.

		if ( $comments ) {
			$this->widget_start( $args, $instance );

			echo wp_kses_post( apply_filters( 'poocommerce_before_widget_product_review_list', '<ul class="product_list_widget">' ) );

			foreach ( (array) $comments as $comment ) {
				wc_get_template(
					'content-widget-reviews.php',
					array(
						'comment' => $comment,
						'product' => wc_get_product( $comment->comment_post_ID ),
					)
				);
			}

			echo wp_kses_post( apply_filters( 'poocommerce_after_widget_product_review_list', '</ul>' ) );

			$this->widget_end( $args );

		}

		$content = ob_get_clean();

		echo $content; // WPCS: XSS ok.

		$this->cache_widget( $args, $content );
	}
}
