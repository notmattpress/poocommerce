<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries;

use Automattic\PooCommerce\Api\Attributes\ArrayOf;
use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Api\Attributes\PublicAccess;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Types\Widget;

/**
 * Returns a plain (non-paginated) list of widgets — exercises the
 * `#[ArrayOf]` element-type declaration on a query's `execute()` *return*
 * value, which the generator turns into `[Widget!]!`.
 *
 * Regression coverage for the return-type list path: distinct from
 * `#[ConnectionOf]` (which {@see ListWidgets} covers) and from `#[ArrayOf]`
 * on properties / parameters (which {@see Widget} and the mutations cover).
 * Before this was fixed, an `array` return with `#[ArrayOf]` fell through to
 * the scalar fallback and emitted `String!`.
 */
#[Name( 'widgetList' )]
#[Description( 'List widgets without pagination.' )]
#[PublicAccess]
class ListWidgetsArray {
	/**
	 * @return Widget[]
	 */
	#[ArrayOf( Widget::class )]
	public function execute(): array {
		return array();
	}
}
