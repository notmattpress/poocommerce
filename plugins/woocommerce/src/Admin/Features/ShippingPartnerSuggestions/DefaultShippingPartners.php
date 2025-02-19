<?php

namespace Automattic\PooCommerce\Admin\Features\ShippingPartnerSuggestions;

/**
 * Default Shipping Partners
 */
class DefaultShippingPartners {

	/**
	 * Get default specs.
	 *
	 * @return array Default specs.
	 */
	public static function get_all() {
		$asset_base_url         = WC()->plugin_url() . '/assets/images/shipping_partners/';
		$column_layout_features = array(
			array(
				'icon'        => $asset_base_url . 'timer.svg',
				'title'       => __( 'Save time', 'poocommerce' ),
				'description' => __(
					'Automatically import order information to quickly print your labels.',
					'poocommerce'
				),
			),
			array(
				'icon'        => $asset_base_url . 'discount.svg',
				'title'       => __( 'Save money', 'poocommerce' ),
				'description' => __(
					'Shop for the best shipping rates, and access pre-negotiated discounted rates.',
					'poocommerce'
				),
			),
			array(
				'icon'        => $asset_base_url . 'star.svg',
				'title'       => __( 'Wow your shoppers', 'poocommerce' ),
				'description' => __(
					'Keep your customers informed with tracking notifications.',
					'poocommerce'
				),
			),
		);

		$check_icon = $asset_base_url . 'check.svg';

		return array(
			array(
				'id'                => 'poocommerce-shipstation-integration',
				'name'              => 'ShipStation',
				'slug'              => 'poocommerce-shipstation-integration',
				'description'       => __( 'Powerful yet easy-to-use solution:', 'poocommerce' ),
				'layout_column'     => array(
					'image'    => $asset_base_url . 'shipstation-column.svg',
					'features' => $column_layout_features,
				),
				'layout_row'        => array(
					'image'    => $asset_base_url . 'shipstation-row.svg',
					'features' => array(
						array(
							'icon'        => $check_icon,
							'description' => __(
								'Discounted labels from top global carriers',
								'poocommerce'
							),
						),
						array(
							'icon'        => $check_icon,
							'description' => __(
								'Sync all your selling channels in one place',
								'poocommerce'
							),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Advanced automated workflows and customs', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Instantly send tracking to your customers', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( '30-day free trial', 'poocommerce' ),
						),
					),
				),
				'learn_more_link'   => 'https://wordpress.org/plugins/poocommerce-shipstation-integration/',
				'is_visible'        => array(
					self::get_rules_for_countries( array( 'AU', 'CA', 'GB' ) ),
				),
				'available_layouts' => array( 'row', 'column' ),
			),
			array(
				'id'                => 'skydropx-cotizador-y-envios',
				'name'              => 'Skydropx',
				'slug'              => 'skydropx-cotizador-y-envios',
				'layout_column'     => array(
					'image'    => $asset_base_url . 'skydropx-column.svg',
					'features' => $column_layout_features,
				),
				'description'       => '',
				'learn_more_link'   => 'https://wordpress.org/plugins/skydropx-cotizador-y-envios/',
				'is_visible'        => array(
					self::get_rules_for_countries( array() ), // No countries eligible for SkydropX promotion at this time.
				),
				'available_layouts' => array( 'column' ),
			),
			array(
				'id'                => 'envia',
				'name'              => 'Envia',
				'slug'              => '',
				'description'       => '',
				'layout_column'     => array(
					'image'    => $asset_base_url . 'envia-column.svg',
					'features' => $column_layout_features,
				),
				'learn_more_link'   => 'https://poocommerce.com/products/envia-shipping-and-fulfillment/',
				'is_visible'        => array(
					self::get_rules_for_countries( array( 'CL', 'AR', 'PE', 'BR', 'UY', 'GT' ) ),
				),
				'available_layouts' => array( 'column' ),
			),
			array(
				'id'                => 'easyship-poocommerce-shipping-rates',
				'name'              => 'Easyship',
				'slug'              => 'easyship-poocommerce-shipping-rates',
				'description'       => __( 'Simplified shipping with: ', 'poocommerce' ),
				'layout_column'     => array(
					'image'    => $asset_base_url . 'easyship-column.svg',
					'features' => $column_layout_features,
				),
				'layout_row'        => array(
					'image'    => $asset_base_url . 'easyship-row.svg',
					'features' => array(
						array(
							'icon'        => $check_icon,
							'description' => __( 'Highly discounted shipping rates', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __(
								'Seamless order sync and label printing',
								'poocommerce'
							),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Branded tracking experience', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Built-in Tax & Duties paperwork', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Free Plan Available', 'poocommerce' ),
						),
					),
				),
				'learn_more_link'   => 'https://poocommerce.com/products/easyship-shipping-rates/',
				'is_visible'        => array(
					self::get_rules_for_countries( array( 'SG', 'HK', 'AU', 'NZ' ) ),
				),
				'available_layouts' => array( 'row', 'column' ),
			),
			array(
				'id'                => 'sendcloud-shipping',
				'name'              => 'Sendcloud',
				'slug'              => 'sendcloud-shipping',
				'description'       => __( 'All-in-one shipping tool:', 'poocommerce' ),
				'layout_column'     => array(
					'image'    => $asset_base_url . 'sendcloud-column.svg',
					'features' => $column_layout_features,
				),
				'layout_row'        => array(
					'image'    => $asset_base_url . 'sendcloud-row.svg',
					'features' => array(
						array(
							'icon'        => $check_icon,
							'description' => __( 'Print labels from 80+ carriers', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __(
								'Process orders in just a few clicks',
								'poocommerce'
							),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Customize checkout options', 'poocommerce' ),
						),

						array(
							'icon'        => $check_icon,
							'description' => __( 'Self-service tracking & returns', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Start with a free plan', 'poocommerce' ),
						),
					),
				),
				'learn_more_link'   => 'https://wordpress.org/plugins/sendcloud-shipping/',
				'is_visible'        => array(
					self::get_rules_for_countries( array( 'NL', 'AT', 'BE', 'FR', 'DE', 'ES', 'GB', 'IT' ) ),
				),
				'available_layouts' => array( 'row', 'column' ),
			),
			array(
				'id'                => 'packlink-pro-shipping',
				'name'              => 'Packlink',
				'slug'              => 'packlink-pro-shipping',
				'description'       => __( 'Optimize your full shipping process:', 'poocommerce' ),
				'layout_column'     => array(
					'image'    => $asset_base_url . 'packlink-column.svg',
					'features' => $column_layout_features,
				),
				'layout_row'        => array(
					'image'    => $asset_base_url . 'packlink-row.svg',
					'features' => array(
						array(
							'icon'        => $check_icon,
							'description' => __(
								'Automated, real-time order import',
								'poocommerce'
							),
						),
						array(
							'icon'        => $check_icon,
							'description' => __(
								'Direct access to leading carriers',
								'poocommerce'
							),
						),
						array(
							'icon'        => $check_icon,
							'description' => __(
								'Access competitive shipping prices',
								'poocommerce'
							),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Quickly bulk print labels', 'poocommerce' ),
						),
						array(
							'icon'        => $check_icon,
							'description' => __( 'Free shipping platform', 'poocommerce' ),
						),
					),
				),
				'learn_more_link'   => 'https://wordpress.org/plugins/packlink-pro-shipping/',
				'is_visible'        => array(
					self::get_rules_for_countries( array( 'FR', 'DE', 'ES', 'IT' ) ),
				),
				'available_layouts' => array( 'row', 'column' ),
			),
			array(
				'id'                => 'poocommerce-services',
				'name'              => 'PooCommerce Shipping',
				'slug'              => 'poocommerce-services',
				'description'       => __( 'Save time and money by printing your shipping labels right from your computer with PooCommerce Shipping. Try PooCommerce Shipping for free.', 'poocommerce' ),
				'dependencies'      => array( 'jetpack' ),
				'layout_column'     => array(
					'image'    => $asset_base_url . 'wcs-column.svg',
					'features' => array(
						array(
							'icon'        => $asset_base_url . 'printer.svg',
							'title'       => __( 'Buy postage when you need it', 'poocommerce' ),
							'description' => __( 'No need to wonder where that stampbook went.', 'poocommerce' ),
						),
						array(
							'icon'        => $asset_base_url . 'paper.svg',
							'title'       => __( 'Print at home', 'poocommerce' ),
							'description' => __( 'Pick up an order, then just pay, print, package and post.', 'poocommerce' ),
						),
						array(
							'icon'        => $asset_base_url . 'discount.svg',
							'title'       => __( 'Discounted rates', 'poocommerce' ),
							'description' => __( 'Access discounted shipping rates with DHL and USPS.', 'poocommerce' ),
						),
					),
				),
				'learn_more_link'   => 'https://poocommerce.com/products/shipping/',
				'is_visible'        => array(
					self::get_rules_for_countries( array( 'US' ) ),
					(object) array(
						'type'    => 'not',
						'operand' => array(
							(object) array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-shipping' ),
							),
						),
					),
					(object) array(
						'type'    => 'not',
						'operand' => array(
							(object) array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-tax' ),
							),
						),
					),
				),
				'available_layouts' => array( 'column' ),
			),
		);
	}

	/**
	 * Get rules that match the store base location to one of the provided countries.
	 *
	 * @param array $countries Array of countries to match.
	 * @return object Rules to match.
	 */
	public static function get_rules_for_countries( $countries ) {
		return (object) array(
			'type'      => 'base_location_country',
			'operation' => 'in',
			'value'     => $countries,
		);
	}
}
