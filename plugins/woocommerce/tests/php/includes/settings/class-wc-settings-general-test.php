<?php
/**
 * Class WC_Settings_General_Test file.
 *
 * @package PooCommerce\Tests\Settings
 */

use Automattic\PooCommerce\Testing\Tools\CodeHacking\Hacks\FunctionsMockerHack;

require_once __DIR__ . '/class-wc-settings-unit-test-case.php';

/**
 * Unit tests for the WC_Settings_General class.
 */
class WC_Settings_General_Test extends WC_Settings_Unit_Test_Case {

	/**
	 * @testdox The real General settings save path persists the form values.
	 */
	public function test_save_persists_general_setting_values() {
		$sut                      = new WC_Settings_General();
		$had_current_section      = array_key_exists( 'current_section', $GLOBALS );
		$original_current_section = $had_current_section ? $GLOBALS['current_section'] : null;

		try {
			// Post what a browser submits: '1' for a ticked checkbox and nothing for an
			// unticked one, so poocommerce_enable_coupons is left out on purpose.
			$_POST                      = array(
				'poocommerce_store_address'               => '5th Avenue',
				'poocommerce_store_address_2'             => 'Suite 4',
				'poocommerce_store_city'                  => 'New York',
				'poocommerce_default_country'             => 'US:NY',
				'poocommerce_store_postcode'              => '10010',
				'poocommerce_allowed_countries'           => 'specific',
				'poocommerce_all_except_countries'        => array( 'CA', 'FR' ),
				'poocommerce_specific_allowed_countries'  => array( 'US', 'CA' ),
				'poocommerce_ship_to_countries'           => 'specific',
				'poocommerce_specific_ship_to_countries'  => array( 'US' ),
				'poocommerce_default_customer_address'    => 'geolocation',
				'poocommerce_calc_taxes'                  => '1',
				'poocommerce_calc_discounts_sequentially' => '1',
				'poocommerce_currency'                    => 'CAD',
				'poocommerce_currency_pos'                => 'left_space',
				'poocommerce_price_thousand_sep'          => '.',
				'poocommerce_price_decimal_sep'           => ',',
				'poocommerce_price_num_decimals'          => '1',
			);
			$GLOBALS['current_section'] = '';

			$sut->save();

			$expected_values = array(
				'poocommerce_store_address'               => '5th Avenue',
				'poocommerce_store_address_2'             => 'Suite 4',
				'poocommerce_store_city'                  => 'New York',
				'poocommerce_default_country'             => 'US:NY',
				'poocommerce_store_postcode'              => '10010',
				'poocommerce_allowed_countries'           => 'specific',
				'poocommerce_all_except_countries'        => array( 'CA', 'FR' ),
				'poocommerce_specific_allowed_countries'  => array( 'US', 'CA' ),
				'poocommerce_ship_to_countries'           => 'specific',
				'poocommerce_specific_ship_to_countries'  => array( 'US' ),
				'poocommerce_default_customer_address'    => 'geolocation',
				'poocommerce_calc_taxes'                  => 'yes',
				'poocommerce_enable_coupons'              => 'no',
				'poocommerce_calc_discounts_sequentially' => 'yes',
				'poocommerce_currency'                    => 'CAD',
				'poocommerce_currency_pos'                => 'left_space',
				'poocommerce_price_thousand_sep'          => '.',
				'poocommerce_price_decimal_sep'           => ',',
				// A string, not an int. save() runs the value through absint(), so
				// update_option() leaves an int in the cache while the row holds '1'.
				// Asserting the int only passes on a cache hit.
				'poocommerce_price_num_decimals'          => '1',
			);

			foreach ( $expected_values as $option_name => $expected_value ) {
				// Autoloaded options are served from the 'alloptions' blob, so deleting
				// the per-option key alone still reads back what update_option() cached
				// rather than what was written. Drop both to reach the row.
				wp_cache_delete( $option_name, 'options' );
				wp_cache_delete( 'alloptions', 'options' );
				$this->assertSame( $expected_value, get_option( $option_name ), "Unexpected persisted value for {$option_name}." );
			}
		} finally {
			// The option rows and $_POST go back with the rollback and the next
			// clean_up_global_scope(); current_section is the one the base class
			// does not touch.
			if ( $had_current_section ) {
				$GLOBALS['current_section'] = $original_current_section;
			} else {
				unset( $GLOBALS['current_section'] );
			}
		}
	}

	/**
	 * Test for get_settings (triggers the poocommerce_general_settings filter).
	 */
	public function test_get_settings__triggers_filter() {
		$actual_settings_via_filter = null;

		add_filter(
			'poocommerce_general_settings',
			function ( $settings ) use ( &$actual_settings_via_filter ) {
				$actual_settings_via_filter = $settings;
				return $settings;
			},
			10,
			1
		);

		$sut = new WC_Settings_General();

		$actual_settings_returned = $sut->get_settings_for_section( '' );
		remove_all_filters( 'poocommerce_general_settings' );

		$this->assertSame( $actual_settings_returned, $actual_settings_via_filter );
	}

	/**
	 * Test for get_settings (all settings are present).
	 */
	public function test_get_settings__all_settings_are_present() {
		$sut = new WC_Settings_General();

		$settings              = $sut->get_settings_for_section( '' );
		$setting_ids_and_types = $this->get_ids_and_types( $settings );

		$expected = array(
			'poocommerce_store_address'                => 'text',
			'poocommerce_store_address_2'              => 'text',
			'poocommerce_store_city'                   => 'text',
			'poocommerce_default_country'              => 'single_select_country',
			'poocommerce_store_postcode'               => 'text',
			'store_address'                            => array( 'title', 'sectionend' ),
			'poocommerce_allowed_countries'            => 'select',
			'poocommerce_all_except_countries'         => 'multi_select_countries',
			'poocommerce_specific_allowed_countries'   => 'multi_select_countries',
			'poocommerce_ship_to_countries'            => 'select',
			'poocommerce_specific_ship_to_countries'   => 'multi_select_countries',
			'poocommerce_default_customer_address'     => 'select',
			'poocommerce_address_autocomplete_enabled' => 'checkbox',
			'poocommerce_calc_taxes'                   => 'checkbox',
			'poocommerce_enable_coupons'               => 'checkbox',
			'poocommerce_calc_discounts_sequentially'  => 'checkbox',
			'general_options'                          => array( 'title', 'sectionend' ),
			'poocommerce_currency'                     => 'select',
			'poocommerce_currency_pos'                 => 'select',
			'poocommerce_price_thousand_sep'           => 'text',
			'poocommerce_price_decimal_sep'            => 'text',
			'poocommerce_price_num_decimals'           => 'number',
			'pricing_options'                          => array( 'title', 'sectionend' ),
			'taxes_and_coupons_options'                => array( 'title', 'sectionend' ),
		);

		$this->assertEquals( $expected, $setting_ids_and_types );
	}

	/**
	 * Test for get_settings (retrieves currencies properly).
	 */
	public function test_get_settings__currencies() {
		FunctionsMockerHack::add_function_mocks(
			array(
				'get_poocommerce_currencies'      => function () {
					return array(
						'c1' => 'Currency 1',
						'c2' => 'Currency 2',
					);
				},
				'get_poocommerce_currency_symbol' => function ( $currency = '' ) {
					return "symbol for $currency";
				},
			)
		);

		$sut = new WC_Settings_General();

		$settings         = $sut->get_settings_for_section( '' );
		$currency_setting = $this->setting_by_id( $settings, 'poocommerce_currency' );
		$currencies       = $currency_setting['options'];

		$expected = array(
			'c1' => 'Currency 1 (symbol for c1) — c1',
			'c2' => 'Currency 2 (symbol for c2) — c2',
		);

		$this->assertEquals( $expected, $currencies );
	}
}
