<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare( strict_types = 1 );
namespace Automattic\PooCommerce\EmailEditor\Integrations\Core\Renderer\Blocks;

use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Rendering_Context;
use Automattic\PooCommerce\EmailEditor\Integrations\Utils\Table_Wrapper_Helper;

/**
 * Fallback block renderer.
 * This renderer is used when no specific renderer is found for a block.
 *
 * AbstractBlockRenderer applies some adjustments to the block content, like adding spacers.
 * By using fallback renderer for all blocks we apply there adjustments to all blocks that don't have any renderer.
 *
 * We need to find a better abstraction/architecture for this.
 */
class Fallback extends Abstract_Block_Renderer {
	/**
	 * Renders the block content
	 *
	 * @param string            $block_content Block content.
	 * @param array             $parsed_block Parsed block.
	 * @param Rendering_Context $rendering_context Rendering context.
	 * @return string
	 */
	protected function render_content( $block_content, array $parsed_block, Rendering_Context $rendering_context ): string {
		$block_attrs = $parsed_block['attrs'] ?? array();

		$table_attrs = array(
			'style' => 'border-collapse: separate;', // Needed because of border radius.
			'width' => '100%',
		);

		$align = $block_attrs['textAlign'] ?? $block_attrs['align'] ?? 'left';

		$cell_attrs = array(
			'align' => $align,
		);

		return Table_Wrapper_Helper::render_table_wrapper( $block_content, $table_attrs, $cell_attrs );
	}
}
