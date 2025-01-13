<?php
/**
 * Settings for flat rate shipping.
 *
 * @package PooCommerce\Classes\Shipping
 */

defined( 'ABSPATH' ) || exit;

$cost_desc = __( 'Enter a cost (excl. tax) or sum, e.g. <code>10.00 * [qty]</code>.', 'poocommerce' ) . '<br/><br/>' . __( 'Use <code>[qty]</code> for the number of items, <br/><code>[cost]</code> for the total cost of items, and <code>[fee percent="10" min_fee="20" max_fee=""]</code> for percentage based fees.', 'poocommerce' );
$cost_link = sprintf( '<span id="wc-shipping-advanced-costs-help-text">%s <a target="_blank" href="https://poocommerce.com/document/flat-rate-shipping/#advanced-costs">%s</a>.</span>', __( 'Charge a flat rate per item, or enter a cost formula to charge a percentage based cost or a minimum fee. Learn more about', 'poocommerce' ), __( 'advanced costs', 'poocommerce' ) );

$settings = array(
	'title'      => array(
		'title'       => __( 'Name', 'poocommerce' ),
		'type'        => 'text',
		'description' => __( 'Your customers will see the name of this shipping method during checkout.', 'poocommerce' ),
		'default'     => __( 'Flat rate', 'poocommerce' ),
		'placeholder' => __( 'e.g. Standard national', 'poocommerce' ),
		'desc_tip'    => true,
	),
	'tax_status' => array(
		'title'   => __( 'Tax status', 'poocommerce' ),
		'type'    => 'select',
		'class'   => 'wc-enhanced-select',
		'default' => 'taxable',
		'options' => array(
			'taxable' => __( 'Taxable', 'poocommerce' ),
			'none'    => _x( 'None', 'Tax status', 'poocommerce' ),
		),
	),
	'cost'       => array(
		'title'             => __( 'Cost', 'poocommerce' ),
		'type'              => 'text',
		'class'             => 'wc-shipping-modal-price',
		'placeholder'       => '',
		'description'       => $cost_desc,
		'default'           => '0',
		'desc_tip'          => true,
		'sanitize_callback' => array( $this, 'sanitize_cost' ),
	),
);

$shipping_classes = WC()->shipping()->get_shipping_classes();

if ( ! empty( $shipping_classes ) ) {
	$settings['class_costs'] = array(
		'title'       => __( 'Shipping class costs', 'poocommerce' ),
		'type'        => 'title',
		'default'     => '',
		/* translators: %s: URL for link */
		'description' => sprintf( __( 'These costs can optionally be added based on the <a target="_blank" href="%s">product shipping class</a>. Learn more about <a target="_blank" href="https://poocommerce.com/document/flat-rate-shipping/#shipping-classes">setting shipping class costs</a>.', 'poocommerce' ), admin_url( 'admin.php?page=wc-settings&tab=shipping&section=classes' ) ),
	);
	foreach ( $shipping_classes as $shipping_class ) {
		if ( ! isset( $shipping_class->term_id ) ) {
			continue;
		}
		$settings[ 'class_cost_' . $shipping_class->term_id ] = array(
			/* translators: %s: shipping class name */
			'title'             => sprintf( __( '"%s" shipping class cost', 'poocommerce' ), esc_html( $shipping_class->name ) ),
			'type'              => 'text',
			'class'             => 'wc-shipping-modal-price',
			'placeholder'       => __( 'N/A', 'poocommerce' ),
			'description'       => $cost_desc,
			'default'           => $this->get_option( 'class_cost_' . $shipping_class->slug ), // Before 2.5.0, we used slug here which caused issues with long setting names.
			'desc_tip'          => true,
			'sanitize_callback' => array( $this, 'sanitize_cost' ),
		);
	}

	$settings['no_class_cost'] = array(
		'title'             => __( 'No shipping class cost', 'poocommerce' ),
		'type'              => 'text',
		'class'             => 'wc-shipping-modal-price',
		'placeholder'       => __( 'N/A', 'poocommerce' ),
		'description'       => $cost_desc,
		'default'           => '',
		'desc_tip'          => true,
		'sanitize_callback' => array( $this, 'sanitize_cost' ),
	);

	$settings['type'] = array(
		'title'       => __( 'Calculation type', 'poocommerce' ),
		'type'        => 'select',
		'class'       => 'wc-enhanced-select',
		'default'     => 'class',
		'options'     => array(
			'class' => __( 'Per class: Charge shipping for each shipping class individually', 'poocommerce' ),
			'order' => __( 'Per order: Charge shipping for the most expensive shipping class', 'poocommerce' ),
		),
		'description' => $cost_link,
	);
}

return $settings;
