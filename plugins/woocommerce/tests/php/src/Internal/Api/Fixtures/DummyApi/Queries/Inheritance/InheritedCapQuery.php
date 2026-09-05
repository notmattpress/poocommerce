<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Inheritance;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;

/**
 * Inherits #[RequiredCapability('manage_options')] from its abstract parent
 * with no direct attribute of its own.
 */
#[Name( 'inheritedCap' )]
#[Description( 'Inherits manage_options from its abstract parent' )]
class InheritedCapQuery extends BaseManageOptionsQuery {
	public function execute(): string {
		return 'inherited cap';
	}
}
