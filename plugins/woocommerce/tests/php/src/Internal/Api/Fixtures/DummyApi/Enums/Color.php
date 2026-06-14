<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Enums;

use Automattic\PooCommerce\Api\Attributes\Description;

#[Description( 'A simple color palette' )]
enum Color: string {
	#[Description( 'Red' )]
	case Red = 'red';

	#[Description( 'Green' )]
	case Green = 'green';

	case Blue = 'blue';
}
