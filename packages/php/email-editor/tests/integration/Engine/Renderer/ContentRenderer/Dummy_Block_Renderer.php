<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer;

use Automattic\PooCommerce\EmailEditor\Engine\Settings_Controller;

/**
 * Dummy block renderer for testing purposes.
 */
class Dummy_Block_Renderer implements Block_Renderer {
	/**
	 * Renders the block.
	 *
	 * @param string              $block_content The block content.
	 * @param array               $parsed_block The parsed block.
	 * @param Settings_Controller $settings_controller The settings controller.
	 * @return string
	 */
	public function render( string $block_content, array $parsed_block, Settings_Controller $settings_controller ): string {
		return $parsed_block['innerHtml'];
	}
}
