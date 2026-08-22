<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\Traits;

use Automattic\PooCommerce\Api\Attributes\RequiredCapability;

/**
 * Trait that grants the manage_poocommerce capability requirement.
 *
 * Classes using this trait inherit the capability via the builder's
 * resolve_capabilities() method, which inspects traits for attributes.
 */
#[RequiredCapability( 'manage_poocommerce' )]
trait RequiresManageWoocommerce {
}
