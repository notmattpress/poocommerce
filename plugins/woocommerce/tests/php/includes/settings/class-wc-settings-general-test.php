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

		$settings               = $sut->get_settings_for_section( '' );
		$settings_ids_and_types = $this->get_ids_and_types( $settings );

		$expected = array(
			'poocommerce_store_address'               => 'text',
			'poocommerce_store_address_2'             => 'text',
			'poocommerce_store_city'                  => 'text',
			'poocommerce_default_country'             => 'single_select_country',
			'poocommerce_store_postcode'              => 'text',
			'store_address'                           => array( 'title', 'sectionend' ),
			'poocommerce_allowed_countries'           => 'select',
			'poocommerce_all_except_countries'        => 'multi_select_countries',
			'poocommerce_specific_allowed_countries'  => 'multi_select_countries',
			'poocommerce_ship_to_countries'           => 'select',
			'poocommerce_specific_ship_to_countries'  => 'multi_select_countries',
			'poocommerce_default_customer_address'    => 'select',
			'poocommerce_calc_taxes'                  => 'checkbox',
			'poocommerce_enable_coupons'              => 'checkbox',
			'poocommerce_calc_discounts_sequentially' => 'checkbox',
			'general_options'                         => array( 'title', 'sectionend' ),
			'poocommerce_currency'                    => 'select',
			'poocommerce_currency_pos'                => 'select',
			'poocommerce_price_thousand_sep'          => 'text',
			'poocommerce_price_decimal_sep'           => 'text',
			'poocommerce_price_num_decimals'          => 'number',
			'pricing_options'                         => array( 'title', 'sectionend' ),
		);

		$this->assertEquals( $expected, $settings_ids_and_types );
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
