<?php
/**
 * Provider class file.
 */

declare(strict_types=1);

namespace Automattic\PooCommerce\Internal\ProductFilters;

use Automattic\PooCommerce\Internal\ProductFilters\Interfaces\QueryClausesGenerator;

defined( 'ABSPATH' ) || exit;

/**
 * Provider class.
 *
 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
 */
class FilterDataProvider {
	/**
	 * Hold initialized providers.
	 *
	 * @var array Product filter data providers.
	 */
	private $providers = array();

	/**
	 * Get the data provider with desired query clauses generator.
	 *
	 * @param QueryClausesGenerator $query_clauses_generator The query clauses generator instance.
	 */
	public function with( QueryClausesGenerator $query_clauses_generator ) {
		$class_name = get_class( $query_clauses_generator );

		if ( ! isset( $this->providers[ $class_name ] ) ) {
			$this->providers[ $class_name ] = new FilterData( $query_clauses_generator );
		}

		return $this->providers[ $class_name ];
	}
}
