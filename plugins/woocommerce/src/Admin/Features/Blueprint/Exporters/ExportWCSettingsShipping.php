<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\PooCommerce\Blueprint\Steps\RunSql;
use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;
use Automattic\PooCommerce\Blueprint\Util;

/**
 * Class ExportWCSettingsShipping
 *
 * Exports PooCommerce settings on the Shipping page.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Exporters
 */
class ExportWCSettingsShipping extends ExportWCSettings {
	/**
	 * Export PooCommerce shipping settings.
	 *
	 * @return array Array of RunSql|SetSiteOptions instances.
	 */
	public function export(): array {
		$shipping_settings = parent::export();

		$steps = array_merge(
			array( $shipping_settings ),
			$this->get_steps_for_classes_and_terms(),
			$this->get_steps_for_zones(),
			$this->get_steps_for_locations(),
			$this->get_steps_for_methods_and_options()
		);

		$steps[] = $this->get_step_for_local_pickup();
		return $steps;
	}

	/**
	 * Retrieve term data based on provided classes.
	 *
	 * @param array $classes List of classes with term IDs.
	 * @return array Retrieved term data.
	 */
	protected function get_terms( array $classes ): array {
		global $wpdb;

		$term_ids = array_map( fn( $term ) => (int) $term['term_id'], $classes );
		$term_ids = implode( ', ', $term_ids );

		return ! empty( $term_ids ) ? $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}terms WHERE term_id IN (%s)",
				$term_ids
			),
			ARRAY_A
		) : array();
	}

	/**
	 * Retrieve shipping classes and related terms.
	 *
	 * @return array Steps for shipping classes and terms.
	 */
	protected function get_steps_for_classes_and_terms(): array {
		global $wpdb;

		$classes = $wpdb->get_results(
			"SELECT * FROM {$wpdb->prefix}term_taxonomy WHERE taxonomy = 'product_shipping_class'",
			ARRAY_A
		);

		$classes_steps = array_map(
			fn( $class_row ) => new RunSql( Util::array_to_insert_sql( $class_row, $wpdb->prefix . 'term_taxonomy', 'replace into' ) ),
			$classes
		);

		$terms = array_map(
			fn( $term ) => new RunSql( Util::array_to_insert_sql( $term, $wpdb->prefix . 'terms', 'replace into' ) ),
			$this->get_terms( $classes )
		);

		return array_merge( $classes_steps, $terms );
	}

	/**
	 * Get the name of the step.
	 *
	 * @return string
	 */
	public function get_step_name(): string {
		return RunSql::get_step_name();
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Shipping', 'poocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'Includes all settings in PooCommerce | Settings | Shipping.', 'poocommerce' );
	}

	/**
	 * Get the alias.
	 *
	 * @return string
	 */
	public function get_alias(): string {
		return 'setWCShipping';
	}

	/**
	 * Retrieve shipping zones from the database.
	 *
	 * @return array Steps for shipping zones.
	 */
	private function get_steps_for_zones(): array {
		global $wpdb;

		return array_map(
			fn( $zone ) => new RunSql( Util::array_to_insert_sql( $zone, $wpdb->prefix . 'poocommerce_shipping_zones', 'replace into' ) ),
			$wpdb->get_results( "SELECT * FROM {$wpdb->prefix}poocommerce_shipping_zones", ARRAY_A )
		);
	}

	/**
	 * Retrieve shipping zone locations.
	 *
	 * @return array Steps for shipping zone locations.
	 */
	private function get_steps_for_locations(): array {
		global $wpdb;

		return array_map(
			fn( $location ) => new RunSql( Util::array_to_insert_sql( $location, $wpdb->prefix . 'poocommerce_shipping_zone_locations', 'replace into' ) ),
			$wpdb->get_results( "SELECT * FROM {$wpdb->prefix}poocommerce_shipping_zone_locations", ARRAY_A )
		);
	}

	/**
	 * Retrieve shipping methods and options.
	 *
	 * @return array Steps for shipping methods and options.
	 */
	private function get_steps_for_methods_and_options(): array {
		global $wpdb;

		$methods        = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}poocommerce_shipping_zone_methods", ARRAY_A );
		$method_options = $wpdb->get_results(
			"SELECT * FROM {$wpdb->prefix}options WHERE option_name LIKE 'poocommerce_flat_rate_%_settings'
            OR option_name LIKE 'poocommerce_free_shipping_%_settings'",
			ARRAY_A
		);

		return array_merge(
			array_map(
				fn( $method ) => new RunSql( Util::array_to_insert_sql( $method, $wpdb->prefix . 'poocommerce_shipping_zone_methods', 'replace into' ) ),
				$methods
			),
			array_map(
				fn( $option ) => new RunSql( Util::array_to_insert_sql( $option, $wpdb->prefix . 'options', 'replace into' ) ),
				$method_options
			)
		);
	}

	/**
	 * Retrieve local pickup settings.
	 *
	 * @return SetSiteOptions Local pickup settings step.
	 */
	private function get_step_for_local_pickup(): SetSiteOptions {
		return new SetSiteOptions(
			array(
				'poocommerce_pickup_location_settings' => get_option( 'poocommerce_pickup_location_settings', array() ),
				'pickup_location_pickup_locations'     => get_option( 'pickup_location_pickup_locations', array() ),
			)
		);
	}

	/**
	 * Check if the current user has the required capabilities for this step.
	 *
	 * @return bool True if the user has the required capabilities. False otherwise.
	 */
	public function check_step_capabilities(): bool {
		return current_user_can( 'manage_poocommerce' );
	}

	/**
	 * Get the page ID for the settings page.
	 *
	 * @return string
	 */
	public function get_page_id(): string {
		return 'shipping';
	}
}
