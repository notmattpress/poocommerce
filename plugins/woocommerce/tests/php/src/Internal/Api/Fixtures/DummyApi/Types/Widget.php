<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Types;

use Automattic\PooCommerce\Api\Attributes\ArrayOf;
use Automattic\PooCommerce\Api\Attributes\ConnectionOf;
use Automattic\PooCommerce\Api\Attributes\Deprecated;
use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\HiddenFromMetadataQuery;
use Automattic\PooCommerce\Api\Attributes\Ignore;
use Automattic\PooCommerce\Api\Attributes\Parameter;
use Automattic\PooCommerce\Api\Attributes\ParameterDescription;
use Automattic\PooCommerce\Api\Attributes\PublicAccess;
use Automattic\PooCommerce\Api\Attributes\RequiredCapability;
use Automattic\PooCommerce\Api\Attributes\ScalarType;
use Automattic\PooCommerce\Api\Pagination\Connection;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Enums\Color;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Enums\Priority;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Interfaces\Named;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Metadata\VisibleSampleMetadata;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Scalars\DummyDateTime;

/**
 * A widget — exercises every attribute applicable to an output type.
 */
#[Description( 'A dummy widget that exercises every output-type attribute' )]
class Widget {
	use Named;

	#[Description( 'A short slug' )]
	public string $slug;

	#[Description( 'An optional caption' )]
	#[VisibleSampleMetadata]
	#[RequiredCapability( 'manage_poocommerce' )]
	public ?string $caption;

	#[Description( 'The widget color' )]
	public Color $color;

	#[Description( 'Priority assigned to this widget' )]
	public Priority $priority;

	#[Description( 'Tag IDs assigned to this widget' )]
	#[ArrayOf( 'int' )]
	#[PublicAccess]
	public array $tag_ids;

	#[Description( 'Notable comments left on this widget' )]
	#[ArrayOf( WidgetReview::class )]
	public array $featured_reviews;

	#[Description( 'Reviews of the widget' )]
	#[ConnectionOf( WidgetReview::class )]
	public Connection $reviews;

	#[Description( 'When the widget was created' )]
	#[ScalarType( DummyDateTime::class )]
	public ?string $date_created;

	/**
	 * Demonstrates a forwarded #[Parameter] argument on a property.
	 *
	 * The matching #[ParameterDescription] is split out below to exercise
	 * that attribute's "augment without redeclaring the type" path.
	 */
	#[Description( 'The widget price' )]
	#[Parameter( name: 'formatted', type: 'bool', default: false )]
	#[ParameterDescription( name: 'formatted', description: 'When true, prepend a $ sign' )]
	public string $price;

	#[Description( 'A field flagged for removal' )]
	#[Deprecated( 'Use price instead.' )]
	#[HiddenFromMetadataQuery]
	public string $legacy_price;

	#[Ignore]
	public ?string $internal_notes;
}
