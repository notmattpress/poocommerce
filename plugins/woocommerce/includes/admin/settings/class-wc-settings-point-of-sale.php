<?php
/**
 * PooCommerce Point of Sale Settings
 *
 * @package PooCommerce\Admin
 */

declare(strict_types=1);

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Internal\Settings\PointOfSaleDefaultSettings;

defined( 'ABSPATH' ) || exit;

if ( class_exists( 'WC_Settings_Point_Of_Sale', false ) ) {
	return new WC_Settings_Point_Of_Sale();
}

/**
 * WC_Settings_Point_Of_Sale.
 */
class WC_Settings_Point_Of_Sale extends WC_Settings_Page {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id    = 'point-of-sale';
		$this->label = __( 'Point of Sale', 'poocommerce' );

		parent::__construct();
	}

	/**
	 * Setting page icon.
	 *
	 * @var string
	 */
	public $icon = 'store';

	/**
	 * Get settings for the default section.
	 *
	 * @return array
	 */
	protected function get_settings_for_default_section() {
		return array(
			array(
				'title' => __( 'Store details', 'poocommerce' ),
				'type'  => 'title',
				'desc'  => __( 'Details about the store that are shown in email receipts.', 'poocommerce' ),
				'id'    => 'store_details',
			),

			array(
				'title'   => __( 'Store name', 'poocommerce' ),
				'desc'    => __( 'The name of your physical store.', 'poocommerce' ),
				'id'      => 'poocommerce_pos_store_name',
				'default' => PointOfSaleDefaultSettings::get_default_store_name(),
				'type'    => 'text',
				'css'     => 'min-width:300px;',
			),

			array(
				'title'    => __( 'Physical address', 'poocommerce' ),
				'id'       => 'poocommerce_pos_store_address',
				'default'  => PointOfSaleDefaultSettings::get_default_store_address(),
				'type'     => 'textarea',
				'css'      => 'min-width:300px; height: 100px;',
				'desc_tip' => true,
			),

			array(
				'title'   => __( 'Phone number', 'poocommerce' ),
				'id'      => 'poocommerce_pos_store_phone',
				'default' => '',
				'type'    => 'text',
				'css'     => 'min-width:300px;',
			),

			array(
				'title'   => __( 'Email', 'poocommerce' ),
				'desc'    => __( 'Your store contact email.', 'poocommerce' ),
				'id'      => 'poocommerce_pos_store_email',
				'default' => PointOfSaleDefaultSettings::get_default_store_email(),
				'type'    => 'email',
				'css'     => 'min-width:300px;',
			),

			array(
				'title'    => __( 'Refund & Returns Policy', 'poocommerce' ),
				'desc'     => __( 'Brief statement that will appear on the receipts.', 'poocommerce' ),
				'id'       => 'poocommerce_pos_refund_returns_policy',
				'default'  => '',
				'type'     => 'textarea',
				'css'      => 'min-width:300px; height: 100px;',
				'desc_tip' => true,
			),

			array(
				'type' => 'sectionend',
				'id'   => 'store_details',
			),
		);
	}
}

return new WC_Settings_Point_Of_Sale();
