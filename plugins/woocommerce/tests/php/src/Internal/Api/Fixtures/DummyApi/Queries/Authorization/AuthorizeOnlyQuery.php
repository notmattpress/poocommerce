<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Queries\Authorization;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;

/**
 * No #[RequiredCapability] / #[PublicAccess]; authorization is decided
 * solely by the authorize() method, which here mirrors its `$allow` argument.
 */
#[Name( 'authorizeOnly' )]
#[Description( 'Authorization decided solely by authorize()' )]
class AuthorizeOnlyQuery {
	public function execute( bool $allow ): string {
		unset( $allow );
		return 'allowed';
	}

	/**
	 * Authorize the call. Mirrors `$allow` so tests can drive both branches.
	 *
	 * @param bool $allow Whether to allow the call.
	 */
	public function authorize( bool $allow ): bool {
		return $allow;
	}
}
