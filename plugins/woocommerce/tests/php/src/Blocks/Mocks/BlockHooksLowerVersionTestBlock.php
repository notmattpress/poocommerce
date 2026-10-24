<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\Mocks;

use Automattic\PooCommerce\Blocks\Utils\BlockHooksTrait;

/**
 * Mock block with an independent version cache for the lower-version test.
 */
class BlockHooksLowerVersionTestBlock extends BlockHooksTestBlock {
	use BlockHooksTrait;
}
