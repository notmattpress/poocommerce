<?php

namespace Automattic\PooCommerce\Internal\Admin\BlockTemplates;

use Automattic\PooCommerce\Admin\BlockTemplates\ContainerInterface;
use Automattic\PooCommerce\Admin\BlockTemplates\BlockInterface;
use Automattic\PooCommerce\Admin\BlockTemplates\BlockTemplateInterface;

/**
 * Block template class.
 */
class BlockTemplate extends AbstractBlockTemplate {
	/**
	 * Get the template ID.
	 */
	public function get_id(): string {
		return 'poocommerce-block-template';
	}

	/**
	 * Add an inner block to this template.
	 *
	 * @param array $block_config The block data.
	 */
	public function add_block( array $block_config ): BlockInterface {
		$block = new Block( $block_config, $this->get_root_template(), $this );
		return $this->add_inner_block( $block );
	}
}
