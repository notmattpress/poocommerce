<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Authorization;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Attributes\RequiresInternalFlag;

/**
 * Gated by {@see RequiresInternalFlag} but carries no `#[Internal]`
 * metadata. The gate should deny: this is the negative path for the
 * metadata slot — `$_metadata['query']` is empty, so the attribute's
 * "is internal?" check returns false.
 */
#[Name( 'metadataAwareNoFlagQuery' )]
#[Description( 'Exercises RequiresInternalFlag without the matching #[Internal] entry.' )]
#[RequiresInternalFlag]
class MetadataAwareNoFlagQuery {
	public function execute(): string {
		return 'ok-no-internal';
	}
}
