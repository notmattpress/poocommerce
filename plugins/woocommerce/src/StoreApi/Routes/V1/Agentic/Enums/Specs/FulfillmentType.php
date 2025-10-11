<?php
declare(strict_types=1);
namespace Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\Enums\Specs;

/**
 * Fulfillment types as defined in the Agentic Commerce Protocol.
 */
class FulfillmentType {
	/**
	 * Physical shipping.
	 */
	const SHIPPING = 'shipping';

	/**
	 * Digital delivery.
	 */
	const DIGITAL = 'digital';
}
