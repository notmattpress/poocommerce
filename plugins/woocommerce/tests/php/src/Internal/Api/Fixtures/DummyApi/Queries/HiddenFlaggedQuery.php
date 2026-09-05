<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\HiddenFromMetadataQuery;
use Automattic\PooCommerce\Api\Attributes\Metadata;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Api\Attributes\PublicAccess;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Types\RuntimeMetaProbe;

/**
 * Public query that is itself hidden from `_apiMetadata` and carries a
 * `runtime_flag` metadata entry. The `by_query` field on its returned type is
 * gated on `$_metadata['query']['runtime_flag']`, so it only grants if the
 * hidden query's metadata still reaches the runtime gate (the discovery
 * opt-out must not blank the published `_query_metadata`).
 */
#[Name( 'hiddenFlagged' )]
#[Description( 'Probe query for runtime metadata visibility under #[HiddenFromMetadataQuery].' )]
#[PublicAccess]
#[Metadata( 'runtime_flag', true )]
#[HiddenFromMetadataQuery]
class HiddenFlaggedQuery {
	public function execute(): RuntimeMetaProbe {
		$probe           = new RuntimeMetaProbe();
		$probe->by_type  = 'type-ok';
		$probe->by_field = 'field-ok';
		$probe->by_query = 'query-ok';
		return $probe;
	}
}
