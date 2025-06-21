<?php
namespace Automattic\PooCommerce\Blocks\BlockTypes;

use Automattic\PooCommerce\Admin\Features\Features;

/**
 * MiniCartTitleBlock class.
 */
class MiniCartTitleBlock extends AbstractInnerBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'mini-cart-title-block';

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
			return $this->render_experimental_iapi_title_block( $attributes, $content, $block );
		}
		return $content;
	}

	/**
	 * Render the interactivity API powered experimental title block.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block content.
	 * @param WP_Block $block      Block instance.
	 * @return string Rendered block type output.
	 */
	protected function render_experimental_iapi_title_block( $attributes, $content, $block ) {
		ob_start();
		?>
		<div class="wp-block-poocommerce-mini-cart-title-block">
			<h2 class="wc-block-mini-cart__title">
				<?php
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					echo $content;
				?>
			</h2>
		</div>
		<?php
		return ob_get_clean();
	}
}
