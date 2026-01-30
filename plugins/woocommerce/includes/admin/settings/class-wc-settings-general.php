<?php
/**
 * PooCommerce General Settings
 *
 * @package PooCommerce\Admin
 */

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Internal\AddressProvider\AddressProviderController;

defined( 'ABSPATH' ) || exit;

if ( class_exists( 'WC_Settings_General', false ) ) {
	return new WC_Settings_General();
}

/**
 * WC_Admin_Settings_General.
 */
class WC_Settings_General extends WC_Settings_Page {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id    = 'general';
		$this->label = __( 'General', 'poocommerce' );

		parent::__construct();
	}

	/**
	 * Setting page icon.
	 *
	 * @var string
	 */
	public $icon = 'cog';

	/**
	 * Get settings or the default section.
	 *
	 * @return array
	 */
	protected function get_settings_for_default_section() {

		$currency_code_options = get_poocommerce_currencies();

		foreach ( $currency_code_options as $code => $name ) {
			$currency_code_options[ $code ] = $name . ' (' . get_poocommerce_currency_symbol( $code ) . ') — ' . esc_html( $code );
		}

		$address_autocomplete_preferred_provider_setting = array();
		$address_autocomplete_setting_desc_tip           = __( 'Suggest full addresses to customers as they type.', 'poocommerce' );

		// This is in a try because getting the class from the container may fail if the class is not available.
		// If it fails, these settings should not be shown as the feature is not available.
		try {
			$address_provider_class         = wc_get_container()->get( AddressProviderController::class );
			$address_autocomplete_providers = $address_provider_class->get_providers();
			$address_autocomplete_available = ! empty( $address_autocomplete_providers );

			if ( ! $address_autocomplete_available ) {
				// translators: %s: WooPayments URL.
				$address_autocomplete_setting_desc_tip .= ' ' . sprintf( __( 'Requires a plugin with predictive address search support (e.g. <a href="%s" target="_blank">WooPayments</a>).', 'poocommerce' ), 'https://poocommerce.com/products/poocommerce-payments/' );
			}

			$enable_address_autocomplete_setting = array(
				'id'       => 'poocommerce_address_autocomplete_enabled',
				'desc'     => __( 'Enable predictive address search', 'poocommerce' ),
				'name'     => __( 'Address autocomplete', 'poocommerce' ),
				'type'     => 'checkbox',
				'disabled' => ! $address_autocomplete_available,
				'desc_tip' => $address_autocomplete_setting_desc_tip,
				'default'  => 'no',
			);

			// If no providers are available, make sure the checkbox is unchecked.
			if ( ! $address_autocomplete_available ) {
				$enable_address_autocomplete_setting['value'] = false;
			}

			if ( count( $address_autocomplete_providers ) > 1 ) {
				$address_provider_options = array();
				foreach ( $address_autocomplete_providers as $address_provider ) {
					$address_provider_options[ $address_provider->id ] = sanitize_text_field( $address_provider->name );
				}
				$address_autocomplete_preferred_provider_setting = array(
					'id'      => 'poocommerce_address_autocomplete_provider',
					'name'    => __( 'Preferred address autocomplete provider', 'poocommerce' ),
					'type'    => 'select',
					'class'   => 'wc-enhanced-select',
					'default' => $address_autocomplete_providers[0]->id ?? '',
					'options' => $address_provider_options,
				);
			}
		} catch ( \Exception $e ) {
			// If the class is not available, we don't want to show the setting.
			wc_get_logger()->log( 'error', 'Error getting address provider class: ' . $e->getMessage() );
			$enable_address_autocomplete_setting             = array();
			$address_autocomplete_preferred_provider_setting = array();
		}

		$settings =
			array(

				array(
					'title' => __( 'Store Address', 'poocommerce' ),
					'type'  => 'title',
					'desc'  => __( 'This is where your business is located. Tax rates and shipping rates will use this address.', 'poocommerce' ),
					'id'    => 'store_address',
					'order' => 10,
				),

				array(
					'title'    => __( 'Address line 1', 'poocommerce' ),
					'desc'     => __( 'The street address for your business location.', 'poocommerce' ),
					'id'       => 'poocommerce_store_address',
					'default'  => '',
					'type'     => 'text',
					'desc_tip' => true,
				),

				array(
					'title'    => __( 'Address line 2', 'poocommerce' ),
					'desc'     => __( 'An additional, optional address line for your business location.', 'poocommerce' ),
					'id'       => 'poocommerce_store_address_2',
					'default'  => '',
					'type'     => 'text',
					'desc_tip' => true,
				),

				array(
					'title'    => __( 'City', 'poocommerce' ),
					'desc'     => __( 'The city in which your business is located.', 'poocommerce' ),
					'id'       => 'poocommerce_store_city',
					'default'  => '',
					'type'     => 'text',
					'desc_tip' => true,
				),

				array(
					'title'    => __( 'Country / State', 'poocommerce' ),
					'desc'     => __( 'The country and state or province, if any, in which your business is located.', 'poocommerce' ),
					'id'       => 'poocommerce_default_country',
					'default'  => 'US:CA',
					'type'     => 'single_select_country',
					'desc_tip' => true,
				),

				array(
					'title'    => __( 'Postcode / ZIP', 'poocommerce' ),
					'desc'     => __( 'The postal code, if any, in which your business is located.', 'poocommerce' ),
					'id'       => 'poocommerce_store_postcode',
					'css'      => 'min-width:50px;',
					'default'  => '',
					'type'     => 'text',
					'desc_tip' => true,
				),

				array(
					'type' => 'sectionend',
					'id'   => 'store_address',
				),

				array(
					'title' => __( 'General options', 'poocommerce' ),
					'type'  => 'title',
					'desc'  => '',
					'id'    => 'general_options',
					'order' => 20,
				),

				array(
					'title'    => __( 'Selling location(s)', 'poocommerce' ),
					'desc'     => __( 'This option lets you limit which countries you are willing to sell to.', 'poocommerce' ),
					'id'       => 'poocommerce_allowed_countries',
					'default'  => 'all',
					'type'     => 'select',
					'class'    => 'wc-enhanced-select',
					'css'      => 'min-width: 350px;',
					'desc_tip' => true,
					'options'  => array(
						'all'        => __( 'Sell to all countries', 'poocommerce' ),
						'all_except' => __( 'Sell to all countries, except for&hellip;', 'poocommerce' ),
						'specific'   => __( 'Sell to specific countries', 'poocommerce' ),
					),
				),

				array(
					'title'   => __( 'Sell to all countries, except for&hellip;', 'poocommerce' ),
					'desc'    => '',
					'id'      => 'poocommerce_all_except_countries',
					'css'     => 'min-width: 350px;',
					'default' => '',
					'type'    => 'multi_select_countries',
				),

				array(
					'title'   => __( 'Sell to specific countries', 'poocommerce' ),
					'desc'    => '',
					'id'      => 'poocommerce_specific_allowed_countries',
					'css'     => 'min-width: 350px;',
					'default' => '',
					'type'    => 'multi_select_countries',
				),

				array(
					'title'    => __( 'Shipping location(s)', 'poocommerce' ),
					'desc'     => __( 'Choose which countries you want to ship to, or choose to ship to all locations you sell to.', 'poocommerce' ),
					'id'       => 'poocommerce_ship_to_countries',
					'default'  => '',
					'type'     => 'select',
					'class'    => 'wc-enhanced-select',
					'desc_tip' => true,
					'options'  => array(
						''         => __( 'Ship to all countries you sell to', 'poocommerce' ),
						'all'      => __( 'Ship to all countries', 'poocommerce' ),
						'specific' => __( 'Ship to specific countries only', 'poocommerce' ),
						'disabled' => __( 'Disable shipping &amp; shipping calculations', 'poocommerce' ),
					),
				),

				array(
					'title'   => __( 'Ship to specific countries', 'poocommerce' ),
					'desc'    => '',
					'id'      => 'poocommerce_specific_ship_to_countries',
					'css'     => '',
					'default' => '',
					'type'    => 'multi_select_countries',
				),

				array(
					'title'    => __( 'Default customer location', 'poocommerce' ),
					'id'       => 'poocommerce_default_customer_address',
					'desc_tip' => __( 'This option determines a customers default location. The MaxMind GeoLite Database will be periodically downloaded to your wp-content directory if using geolocation.', 'poocommerce' ),
					'default'  => 'base',
					'type'     => 'select',
					'class'    => 'wc-enhanced-select',
					'options'  => array(
						''                 => __( 'No location by default', 'poocommerce' ),
						'base'             => __( 'Shop country/region', 'poocommerce' ),
						'geolocation'      => __( 'Geolocate', 'poocommerce' ),
						'geolocation_ajax' => __( 'Geolocate (with page caching support)', 'poocommerce' ),
					),
				),

				$enable_address_autocomplete_setting,

				$address_autocomplete_preferred_provider_setting,

				array(
					'type' => 'sectionend',
					'id'   => 'general_options',
				),

				array(
					'title' => __( 'Taxes and coupons', 'poocommerce' ),
					'type'  => 'title',
					'desc'  => __( 'Enable taxes and coupons and configure how they are calculated.', 'poocommerce' ),
					'id'    => 'taxes_and_coupons_options',
					'order' => 30,
				),

				array(
					'title'    => __( 'Enable taxes', 'poocommerce' ),
					'desc'     => __( 'Enable tax rates and calculations', 'poocommerce' ),
					'id'       => 'poocommerce_calc_taxes',
					'default'  => 'no',
					'type'     => 'checkbox',
					'desc_tip' => __( 'Rates will be configurable and taxes will be calculated during checkout.', 'poocommerce' ),
				),

				array(
					'title'           => __( 'Enable coupons', 'poocommerce' ),
					'desc'            => __( 'Enable the use of coupon codes', 'poocommerce' ),
					'id'              => 'poocommerce_enable_coupons',
					'default'         => 'yes',
					'type'            => 'checkbox',
					'checkboxgroup'   => 'start',
					'show_if_checked' => 'option',
					'desc_tip'        => __( 'Coupons can be applied from the cart and checkout pages.', 'poocommerce' ),
				),

				array(
					'desc'            => __( 'Calculate coupon discounts sequentially', 'poocommerce' ),
					'id'              => 'poocommerce_calc_discounts_sequentially',
					'default'         => 'no',
					'type'            => 'checkbox',
					'desc_tip'        => __( 'When applying multiple coupons, apply the first coupon to the full price and the second coupon to the discounted price and so on.', 'poocommerce' ),
					'show_if_checked' => 'yes',
					'checkboxgroup'   => 'end',
					'autoload'        => false,
				),

				array(
					'type' => 'sectionend',
					'id'   => 'taxes_and_coupons_options',
				),

				array(
					'title' => __( 'Currency options', 'poocommerce' ),
					'type'  => 'title',
					'desc'  => __( 'The following options affect how prices are displayed on the frontend.', 'poocommerce' ),
					'id'    => 'pricing_options',
					'order' => 40,
				),

				array(
					'title'    => __( 'Currency', 'poocommerce' ),
					'desc'     => __( 'This controls what currency prices are listed at in the catalog and which currency gateways will take payments in.', 'poocommerce' ),
					'id'       => 'poocommerce_currency',
					'default'  => 'USD',
					'type'     => 'select',
					'class'    => 'wc-enhanced-select',
					'desc_tip' => true,
					'options'  => $currency_code_options,
				),

				array(
					'title'    => __( 'Currency position', 'poocommerce' ),
					'desc'     => __( 'This controls the position of the currency symbol.', 'poocommerce' ),
					'id'       => 'poocommerce_currency_pos',
					'class'    => 'wc-enhanced-select',
					'default'  => 'left',
					'type'     => 'select',
					'options'  => array(
						'left'        => __( 'Left', 'poocommerce' ),
						'right'       => __( 'Right', 'poocommerce' ),
						'left_space'  => __( 'Left with space', 'poocommerce' ),
						'right_space' => __( 'Right with space', 'poocommerce' ),
					),
					'desc_tip' => true,
				),

				array(
					'title'    => __( 'Thousand separator', 'poocommerce' ),
					'desc'     => __( 'This sets the thousand separator of displayed prices.', 'poocommerce' ),
					'id'       => 'poocommerce_price_thousand_sep',
					'css'      => 'width:50px;',
					'default'  => ',',
					'type'     => 'text',
					'desc_tip' => true,
				),

				array(
					'title'    => __( 'Decimal separator', 'poocommerce' ),
					'desc'     => __( 'This sets the decimal separator of displayed prices.', 'poocommerce' ),
					'id'       => 'poocommerce_price_decimal_sep',
					'css'      => 'width:50px;',
					'default'  => '.',
					'type'     => 'text',
					'desc_tip' => true,
				),

				array(
					'title'             => __( 'Number of decimals', 'poocommerce' ),
					'desc'              => __( 'This sets the number of decimal points shown in displayed prices.', 'poocommerce' ),
					'id'                => 'poocommerce_price_num_decimals',
					'css'               => 'width:50px;',
					'default'           => '2',
					'desc_tip'          => true,
					'type'              => 'number',
					'custom_attributes' => array(
						'min'  => 0,
						'step' => 1,
					),
				),

				array(
					'type' => 'sectionend',
					'id'   => 'pricing_options',
				),
			);

		// Remove any empty items from settings array.
		// e.g. The preferred autocomplete provider setting would be empty if <=1 providers are registered.
		$settings = array_filter(
			$settings,
			function ( $setting ) {
				return ! empty( $setting );
			}
		);
		return apply_filters( 'poocommerce_general_settings', $settings );
	}

	/**
	 * Output a color picker input box.
	 *
	 * @param mixed  $name Name of input.
	 * @param string $id ID of input.
	 * @param mixed  $value Value of input.
	 * @param string $desc (default: '') Description for input.
	 */
	public function color_picker( $name, $id, $value, $desc = '' ) {
		echo '<div class="color_box">' . wc_help_tip( $desc ) . '
			<input name="' . esc_attr( $id ) . '" id="' . esc_attr( $id ) . '" type="text" value="' . esc_attr( $value ) . '" class="colorpick" /> <div id="colorPickerDiv_' . esc_attr( $id ) . '" class="colorpickdiv"></div>
		</div>';
	}

	/**
	 * Output settings with additional JS to hide preferred provider if autocomplete is disabled.
	 *
	 * @return void
	 */
	public function output() {
		parent::output();

		$handle = 'wc-admin-settings-general';
		wp_register_script( $handle, '', array(), WC_VERSION, array( 'in_footer' => true ) );
		wp_enqueue_script( $handle );
		wp_add_inline_script(
			$handle,
			"
			const preferredProviderInput = document.querySelector( '#poocommerce_address_autocomplete_provider' );
			const autocompleteEnabledInput = document.querySelector( '#poocommerce_address_autocomplete_enabled' );
			let preferredProviderRow = null;
			if ( preferredProviderInput ) {
				preferredProviderRow = preferredProviderInput.closest( 'tr' );
			}
			if ( autocompleteEnabledInput && preferredProviderRow ) {
				if ( ! autocompleteEnabledInput.checked ) {
					preferredProviderRow.style.display = 'none';
				}
				autocompleteEnabledInput.addEventListener( 'change', function( e ) {
					if ( e.target.checked ) {
						preferredProviderRow.style.display = 'table-row';
					} else {
						preferredProviderRow.style.display = 'none';
					}
				} );
			}
			"
		);
	}
}

return new WC_Settings_General();
