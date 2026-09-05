<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\InputTypes;

use Automattic\PooCommerce\Api\Attributes\Description;
use Automattic\PooCommerce\Api\Attributes\Name;
use Automattic\PooCommerce\Tests\Internal\Api\Fixtures\DummyApi\Enums\Color;

/**
 * Filter input applied to widget listings. Used as an unrolled #[Unroll]
 * parameter on `ListWidgets::execute()` so its public properties become
 * individual GraphQL arguments.
 *
 * Carries an explicit constructor with promoted parameters because the
 * generator emits `new WidgetFilterInput(search: ..., color: ...)` for the
 * unrolled call site.
 */
#[Name( 'WidgetFilterArgs' )]
#[Description( 'Filters applied to a widget listing' )]
class WidgetFilterInput {
	/**
	 * Constructor.
	 *
	 * @param ?string $search A free-text search term.
	 * @param ?Color  $color  Filter widgets by color.
	 */
	public function __construct(
		#[Description( 'A free-text search term' )]
		public ?string $search = null,
		#[Description( 'Filter widgets by color' )]
		public ?Color $color = null,
	) {
	}
}
