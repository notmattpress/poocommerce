<?php

namespace Automattic\PooCommerce\Internal\Admin\BlockTemplates;

use Automattic\PooCommerce\Admin\BlockTemplates\BlockContainerInterface;
use Automattic\PooCommerce\Admin\BlockTemplates\BlockInterface;
use Automattic\PooCommerce\Admin\BlockTemplates\BlockTemplateInterface;

/**
 * Generic block with container properties to be used in BlockTemplate.
 */
class Block extends AbstractBlock implements BlockContainerInterface {
	use BlockContainerTrait;

	/**
	 * Add an inner block to this block.
	 *
	 * @param array $block_config The block data.
	 */
	public function &add_block( array $block_config ): BlockInterface {
		$block = new Block( $block_config, $this->get_root_template(), $this );
		return $this->add_inner_block( $block );
	}
}
