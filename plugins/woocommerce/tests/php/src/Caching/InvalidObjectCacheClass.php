<?php

namespace Automattic\PooCommerce\Tests\Caching;

use Automattic\PooCommerce\Caching\ObjectCache;

/**
 * An implementation of CacheEngine that is invalid (returns an empty object type).
 */
class InvalidObjectCacheClass extends ObjectCache {


	// phpcs:disable Squiz.Commenting
	public function get_object_type(): string {
		return '';
	}

	protected function get_object_id( $object ) {
	}

	protected function validate( $object ): ?array {
	}

	protected function get_from_datastore( $id ) {
	}
	// phpcs:enable Squiz.Commenting

}
