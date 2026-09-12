<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare( strict_types = 1 );
namespace Automattic\PooCommerce\EmailEditor\Integrations\PooCommerce\Renderer\Blocks;

use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Block_Renderer;
use Automattic\PooCommerce\EmailEditor\Integrations\Core\Renderer\Blocks\Abstract_Block_Renderer;

/**
 * Shared functionality for block renderers.
 */
abstract class Abstract_Product_Block_Renderer extends Abstract_Block_Renderer implements Block_Renderer {
	/**
	 * Get product from block context.
	 *
	 * @param array $parsed_block Parsed block.
	 * @return \WC_Product|null
	 */
	protected function get_product_from_context( array $parsed_block ): ?\WC_Product {
		$post_id = $parsed_block['context']['postId'] ?? 0;

		if ( ! $post_id ) {
			global $product;
			if ( $product && is_a( $product, 'WC_Product' ) ) {
				$post_id = $product->get_id();
			}
		}

		if ( ! $post_id ) {
			global $post;
			if ( $post && get_post_type( $post->ID ) === 'product' ) {
				$post_id = $post->ID;
			}
		}

		$product = $post_id ? wc_get_product( $post_id ) : null;
		return $product ? $product : null;
	}
}
