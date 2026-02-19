<?php

namespace Automattic\PooCommerce\Tests\Internal\Admin\BlockTemplates;

use Automattic\PooCommerce\Admin\BlockTemplates\BlockContainerInterface;
use Automattic\PooCommerce\Admin\BlockTemplates\BlockInterface;

interface CustomBlockInterface extends BlockContainerInterface {
	/**
	 * Adds a method to insert a specific custom inner block.
	 *
	 * @param string $title The title.
	 */
	public function add_custom_inner_block( string $title ): BlockInterface;
}
