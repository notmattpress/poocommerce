<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Authorization;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Internal;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Attributes\RequiresInternalFlag;

/**
 * Carries an `#[Internal]` metadata entry and is gated by
 * {@see RequiresInternalFlag}, which reads `$_metadata['query']['internal']`.
 * The gate should grant: this is the happy path for the metadata slot.
 */
#[Name( 'metadataAwareInternalQuery' )]
#[Description( 'Exercises RequiresInternalFlag against a class that carries #[Internal].' )]
#[Internal]
#[RequiresInternalFlag]
class MetadataAwareInternalQuery {
	public function execute(): string {
		return 'ok-internal';
	}
}
