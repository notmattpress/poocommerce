<?php
/**
 * Tax settings.
 *
 * @package PooCommerce\Admin\Settings.
 */

defined( 'ABSPATH' ) || exit;

$settings = array(

	array(
		'title' => __( 'Tax options', 'poocommerce' ),
		'type'  => 'title',
		'desc'  => '',
		'id'    => 'tax_options',
	),

	array(
		'title'    => __( 'Prices entered with tax', 'poocommerce' ),
		'id'       => 'poocommerce_prices_include_tax',
		'default'  => 'no',
		'type'     => 'radio',
		'desc_tip' => __( 'This option is important as it will affect how you input prices. Changing it will not update existing products.', 'poocommerce' ),
		'options'  => array(
			'yes' => __( 'Yes, I will enter prices inclusive of tax', 'poocommerce' ),
			'no'  => __( 'No, I will enter prices exclusive of tax', 'poocommerce' ),
		),
	),

	array(
		'title'    => __( 'Calculate tax based on', 'poocommerce' ),
		'id'       => 'poocommerce_tax_based_on',
		'desc_tip' => __( 'This option determines which address is used to calculate tax.', 'poocommerce' ),
		'default'  => 'shipping',
		'type'     => 'select',
		'class'    => 'wc-enhanced-select',
		'options'  => array(
			'shipping' => __( 'Customer shipping address', 'poocommerce' ),
			'billing'  => __( 'Customer billing address', 'poocommerce' ),
			'base'     => __( 'Shop base address', 'poocommerce' ),
		),
	),

	'shipping-tax-class' => array(
		'title'    => __( 'Shipping tax class', 'poocommerce' ),
		'desc'     => __( 'Optionally control which tax class shipping gets, or leave it so shipping tax is based on the cart items themselves.', 'poocommerce' ),
		'id'       => 'poocommerce_shipping_tax_class',
		'css'      => 'min-width:150px;',
		'default'  => 'inherit',
		'type'     => 'select',
		'class'    => 'wc-enhanced-select',
		'options'  => array( 'inherit' => __( 'Shipping tax class based on cart items', 'poocommerce' ) ) + wc_get_product_tax_class_options(),
		'desc_tip' => true,
	),

	array(
		'title'   => __( 'Rounding', 'poocommerce' ),
		'desc'    => __( 'Round tax at subtotal level, instead of rounding per line', 'poocommerce' ),
		'id'      => 'poocommerce_tax_round_at_subtotal',
		'default' => 'no',
		'type'    => 'checkbox',
	),

	array(
		'title'     => __( 'Additional tax classes', 'poocommerce' ),
		'desc_tip'  => __( 'List additional tax classes you need below (1 per line, e.g. Reduced Rates). These are in addition to "Standard rate" which exists by default.', 'poocommerce' ),
		'id'        => 'poocommerce_tax_classes',
		'css'       => 'height: 65px;',
		'type'      => 'textarea',
		'default'   => '',
		'is_option' => false,
		'value'     => implode( "\n", WC_Tax::get_tax_classes() ),
	),

	array(
		'title'   => __( 'Display prices in the shop', 'poocommerce' ),
		'id'      => 'poocommerce_tax_display_shop',
		'default' => 'excl',
		'type'    => 'select',
		'class'   => 'wc-enhanced-select',
		'options' => array(
			'incl' => __( 'Including tax', 'poocommerce' ),
			'excl' => __( 'Excluding tax', 'poocommerce' ),
		),
	),

	array(
		'title'   => __( 'Display prices during cart and checkout', 'poocommerce' ),
		'id'      => 'poocommerce_tax_display_cart',
		'default' => 'excl',
		'type'    => 'select',
		'class'   => 'wc-enhanced-select',
		'options' => array(
			'incl' => __( 'Including tax', 'poocommerce' ),
			'excl' => __( 'Excluding tax', 'poocommerce' ),
		),
	),

	array( 'type' => 'conflict_error' ), // React mount point for embedded banner slotfill.
	array( 'type' => 'add_settings_slot' ), // React mount point for settings slotfill.

	array(
		'title'       => __( 'Price display suffix', 'poocommerce' ),
		'id'          => 'poocommerce_price_display_suffix',
		'default'     => '',
		'placeholder' => __( 'N/A', 'poocommerce' ),
		'type'        => 'text',
		'desc_tip'    => __( 'Define text to show after your product prices. This could be, for example, "inc. Vat" to explain your pricing. You can also have prices substituted here using one of the following: {price_including_tax}, {price_excluding_tax}.', 'poocommerce' ),
	),

	array(
		'title'    => __( 'Display tax totals', 'poocommerce' ),
		'id'       => 'poocommerce_tax_total_display',
		'default'  => 'itemized',
		'type'     => 'select',
		'class'    => 'wc-enhanced-select',
		'options'  => array(
			'single'   => __( 'As a single total', 'poocommerce' ),
			'itemized' => __( 'Itemized', 'poocommerce' ),
		),
		'autoload' => false,
	),

	array(
		'type' => 'sectionend',
		'id'   => 'tax_options',
	),

);

if ( ! wc_shipping_enabled() ) {
	unset( $settings['shipping-tax-class'] );
}

return apply_filters( 'poocommerce_tax_settings', $settings );
