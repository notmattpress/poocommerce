<?php
/**
 * Reports Data Store Interface
 */

namespace Automattic\PooCommerce\Admin\API\Reports;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PooCommerce Reports data store interface.
 *
 * @since 3.5.0
 */
interface DataStoreInterface {

	/**
	 * Get the data based on args.
	 *
	 * @param array $args Query parameters.
	 * @return stdClass|WP_Error
	 */
	public function get_data( $args );
}
