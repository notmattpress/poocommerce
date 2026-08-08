<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Authorization;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Api\Attributes\PublicAccess;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Store;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Types\Widget;

/**
 * Publicly-accessible Widget query used by the field-level authorization tests
 * to reach a `Widget` instance without first passing through the class-level
 * `#[RequiredCapability]` gate on `GetWidget`. Lets the field-level gates on
 * `Widget`'s properties be exercised in isolation.
 */
#[Name( 'publicWidget' )]
#[Description( 'Fetch a widget without query-level gating; field-level gates apply.' )]
#[PublicAccess]
class PublicWidgetAccess {
	public function execute(): ?Widget {
		return Store::get_widget( 1 );
	}
}
