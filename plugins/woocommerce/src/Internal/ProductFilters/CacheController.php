<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Internal\ProductFilters;

use Automattic\PooCommerce\Internal\RegisterHooksInterface;
use WC_Cache_Helper;

defined( 'ABSPATH' ) || exit;

/**
 * Hooks into PooCommerce actions to register cache invalidation.
 *
 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
 */
class CacheController implements RegisterHooksInterface {
	const CACHE_GROUP = 'filter_data';

	/**
	 * Hook into actions and filters.
	 */
	public function register() {
		add_action( 'poocommerce_after_product_object_save', array( $this, 'clear_filter_data_cache' ) );
		add_action( 'poocommerce_delete_product_transients', array( $this, 'clear_filter_data_cache' ) );
	}

	/**
	 * Invalidate all cache under filter data group.
	 */
	public function clear_filter_data_cache() {
		WC_Cache_Helper::get_transient_version( self::CACHE_GROUP, true );
		WC_Cache_Helper::invalidate_cache_group( self::CACHE_GROUP );
	}
}
