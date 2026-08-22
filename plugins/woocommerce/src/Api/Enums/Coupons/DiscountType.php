<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\Enums\Coupons;

use Automattic\PooCommerce\Api\Attributes\Description;

#[Description( 'The type of discount for a coupon.' )]
enum DiscountType: string {
	#[Description( 'A percentage discount.' )]
	case Percent = 'percent';

	#[Description( 'A fixed amount discount applied to the cart.' )]
	case FixedCart = 'fixed_cart';

	#[Description( 'A fixed amount discount applied to each eligible product.' )]
	case FixedProduct = 'fixed_product';

	#[Description( 'The discount type is not one of the standard PooCommerce values (e.g. added by a plugin). Inspect raw_discount_type for the underlying value.' )]
	case Other = 'other';
}
