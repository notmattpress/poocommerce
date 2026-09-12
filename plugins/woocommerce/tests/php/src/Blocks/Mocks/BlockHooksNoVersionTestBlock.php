<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\Mocks;

use Automattic\PooCommerce\Blocks\Utils\BlockHooksTrait;

/**
 * Mock block with an independent version cache for the no-version test.
 */
class BlockHooksNoVersionTestBlock extends BlockHooksTestBlock {
	use BlockHooksTrait;
}
