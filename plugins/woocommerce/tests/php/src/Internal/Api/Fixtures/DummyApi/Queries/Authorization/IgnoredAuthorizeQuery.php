<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Authorization;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Ignore;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Api\Attributes\RequiredCapability;

/**
 * authorize() carries #[Ignore]; the builder must skip it and rely on
 * #[RequiredCapability] alone. The authorize() body returns `false`, so if
 * the builder *did* call it, every request would be rejected — making any
 * regression unmistakable.
 */
#[Name( 'ignoredAuthorize' )]
#[Description( 'authorize() with #[Ignore] is skipped; the cap check applies' )]
#[RequiredCapability( 'manage_options' )]
class IgnoredAuthorizeQuery {
	public function execute(): string {
		return 'cap enforced';
	}

	#[Ignore]
	public function authorize(): bool {
		return false;
	}
}
