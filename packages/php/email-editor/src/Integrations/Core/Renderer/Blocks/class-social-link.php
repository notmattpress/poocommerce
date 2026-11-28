<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare( strict_types = 1 );
namespace Automattic\PooCommerce\EmailEditor\Integrations\Core\Renderer\Blocks;

use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Rendering_Context;

/**
 * Renders a social link block.
 */
class Social_Link extends Abstract_Block_Renderer {

	/**
	 * Renders the block content.
	 *
	 * @param string            $block_content Block content.
	 * @param array             $parsed_block Parsed block.
	 * @param Rendering_Context $rendering_context Rendering context.
	 * @return string
	 */
	protected function render_content( $block_content, array $parsed_block, Rendering_Context $rendering_context ): string {
		// We are not using this because the blocks are rendered in the Social_Links block class.
		return $block_content;
	}
}
