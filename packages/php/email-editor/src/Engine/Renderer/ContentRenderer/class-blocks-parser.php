<?php
/**
 * This file is part of the PooCommerce Email Editor package.
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer;

use WP_Block_Parser;

/**
 * Class Blocks_Parser
 */
class Blocks_Parser extends WP_Block_Parser {
	/**
	 * List of parsed blocks
	 *
	 * @var \WP_Block_Parser_Block[]
	 */
	public $output;

	/**
	 * Parse the blocks from the document
	 *
	 * @param string $document Document to parse.
	 * @return array[]
	 */
	public function parse( $document ) {
		parent::parse( $document );
		return apply_filters( 'poocommerce_email_blocks_renderer_parsed_blocks', $this->output );
	}
}
