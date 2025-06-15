<?php
namespace Automattic\PooCommerce\Blocks\BlockTypes;

use Automattic\PooCommerce\Admin\Features\Features;

/**
 * MiniCartTitleItemsCounterBlock class.
 */
class MiniCartTitleItemsCounterBlock extends AbstractInnerBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'mini-cart-title-items-counter-block';

	/**
	 * Render the block.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block content.
	 * @param WP_Block $block      Block instance.
	 * @return string Rendered block type output.
	 */
	protected function render( $attributes, $content, $block ) {
		if ( Features::is_enabled( 'experimental-iapi-mini-cart' ) ) {
			return $this->render_experimental_iapi_title_label_block();
		}
		return $content;
	}

	/**
	 * Render the interactivity API powered experimental title block.
	 *
	 * @return string Rendered block type output.
	 */
	protected function render_experimental_iapi_title_label_block() {
		$cart            = $this->get_cart_instance();
		$cart_item_count = $cart ? $cart->get_cart_contents_count() : 0;
		// translators: %d number of items in the cart.
		$cart_item_text = _n( '(%d item)', '(%d items)', $cart_item_count, 'poocommerce' );

		// translators: item is an item in cart.
		$singular = __( '(%d item)', 'poocommerce' );
		// translators: items is items in a cart.
		$plural = __( '(%d items)', 'poocommerce' );

		wp_interactivity_config(
			$this->get_full_block_name(),
			array(
				'singularItemsText' => $singular,
				'pluralItemsText'   => $plural,
			)
		);

		wp_interactivity_state(
			$this->get_full_block_name(),
			array(
				'itemsInCartText' => sprintf( $cart_item_text, $cart_item_count ),
			)
		);

		ob_start();
		?>
		<span data-wp-text="state.itemsInCartText" data-wp-interactive="poocommerce/mini-cart-title-items-counter-block" class="wp-block-poocommerce-mini-cart-title-items-counter-block">
		</span>
		<?php
		return ob_get_clean();
	}

	/**
	 * Return the main instance of WC_Cart class.
	 *
	 * @return \WC_Cart CartController class instance.
	 */
	protected function get_cart_instance() {
		$cart = WC()->cart;

		if ( $cart && $cart instanceof \WC_Cart ) {
			return $cart;
		}

		return null;
	}
}
