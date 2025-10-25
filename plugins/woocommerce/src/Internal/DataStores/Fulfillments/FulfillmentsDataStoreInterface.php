<?php
/**
 * Fulfillments Data Store Interface
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\DataStores\Fulfillments;

use Automattic\PooCommerce\Internal\Fulfillments\Fulfillment;

/**
 * Interface FulfillmentsDataStoreInterface
 *
 * @package Automattic\PooCommerce\Internal\DataStores\Fulfillments
 */
interface FulfillmentsDataStoreInterface {
	/**
	 * Read the fulfillment data.
	 *
	 * @param string $entity_type The entity type.
	 * @param string $entity_id The entity ID.
	 *
	 * @return Fulfillment[] Fulfillment object.
	 */
	public function read_fulfillments( string $entity_type, string $entity_id ): array;
}
