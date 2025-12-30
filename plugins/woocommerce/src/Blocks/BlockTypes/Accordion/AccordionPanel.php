<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Blocks\BlockTypes\Accordion;

use Automattic\PooCommerce\Blocks\BlockTypes\AbstractBlock;
use Automattic\PooCommerce\Blocks\BlockTypes\EnableBlockJsonAssetsTrait;
/**
 * AccordionPanel class.
 */
class AccordionPanel extends AbstractBlock {

	use EnableBlockJsonAssetsTrait;

	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'accordion-panel';
}
