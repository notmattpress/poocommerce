<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\InputTypes;

use Automattic\PooCommerce\Api\Attributes\ArrayOf;
use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\RequiredCapability;
use Automattic\PooCommerce\Api\Attributes\ScalarType;
use Automattic\PooCommerce\Api\InputTypes\TracksProvidedFields;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Enums\Color;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Scalars\DummyDateTime;

/**
 * Input type for creating a widget.
 */
#[Description( 'Data needed to create a new widget' )]
class CreateWidgetInput {
	use TracksProvidedFields;

	#[Description( 'The widget label' )]
	public string $label;

	#[Description( 'Optional weight in grams' )]
	#[RequiredCapability( 'manage_poocommerce' )]
	public ?int $weight = null;

	#[Description( 'The widget color' )]
	public Color $color;

	#[Description( 'Tag IDs to attach to the widget' )]
	#[ArrayOf( 'int' )]
	public ?array $tag_ids = null;

	#[Description( 'When the widget should expire' )]
	#[ScalarType( DummyDateTime::class )]
	public ?string $expires_at = null;
}
