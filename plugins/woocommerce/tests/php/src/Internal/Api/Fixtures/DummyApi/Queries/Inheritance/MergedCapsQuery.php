<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Inheritance;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Authorization\RequiresEditPostsTrait;

/**
 * Inherits caps from two sources at once: manage_options from its parent
 * class, edit_posts from its trait. The builder should require both.
 */
#[Name( 'mergedCaps' )]
#[Description( 'Merges caps from a parent class and a trait' )]
class MergedCapsQuery extends BaseManageOptionsQuery {
	use RequiresEditPostsTrait;

	public function execute(): string {
		return 'merged caps';
	}
}
