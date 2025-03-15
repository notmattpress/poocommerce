<?php
/**
 * PooCommerce Product Settings
 *
 * @package PooCommerce\Admin
 * @version 2.4.0
 */

use Automattic\PooCommerce\Utilities\I18nUtil;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'WC_Settings_Products', false ) ) {
	return new WC_Settings_Products();
}

/**
 * WC_Settings_Products.
 */
class WC_Settings_Products extends WC_Settings_Page {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id    = 'products';
		$this->label = __( 'Products', 'poocommerce' );

		parent::__construct();
	}

	/**
	 * Setting page icon.
	 *
	 * @var string
	 */
	public $icon = 'box';

	/**
	 * Get own sections.
	 *
	 * @return array
	 */
	protected function get_own_sections() {
		return array(
			''             => __( 'General', 'poocommerce' ),
			'inventory'    => __( 'Inventory', 'poocommerce' ),
			'downloadable' => __( 'Downloadable products', 'poocommerce' ),
		);
	}

	/**
	 * Get settings for the default section.
	 *
	 * @return array
	 */
	protected function get_settings_for_default_section() {
		$locale_info            = include WC()->plugin_path() . '/i18n/locale-info.php';
		$default_weight_unit    = $locale_info['US']['weight_unit'];
		$default_dimension_unit = $locale_info['US']['dimension_unit'];

		$settings =
			array(
				array(
					'title' => __( 'Shop pages', 'poocommerce' ),
					'type'  => 'title',
					'desc'  => '',
					'id'    => 'catalog_options',
				),
				array(
					'title'    => __( 'Shop page', 'poocommerce' ),
					/* translators: %s: URL to settings. */
					'desc'     => sprintf( __( 'The base page can also be used in your <a href="%s">product permalinks</a>.', 'poocommerce' ), admin_url( 'options-permalink.php' ) ),
					'id'       => 'poocommerce_shop_page_id',
					'type'     => 'single_select_page',
					'default'  => '',
					'class'    => 'wc-enhanced-select-nostd',
					'css'      => 'min-width:300px;',
					'desc_tip' => __( 'This sets the base page of your shop - this is where your product archive will be.', 'poocommerce' ),
				),
				array(
					'title'         => __( 'Add to cart behaviour', 'poocommerce' ),
					'desc'          => __( 'Redirect to the cart page after successful addition', 'poocommerce' ),
					'id'            => 'poocommerce_cart_redirect_after_add',
					'default'       => 'no',
					'type'          => 'checkbox',
					'checkboxgroup' => 'start',
				),
				array(
					'desc'          => __( 'Enable AJAX add to cart buttons on archives', 'poocommerce' ),
					'id'            => 'poocommerce_enable_ajax_add_to_cart',
					'default'       => 'yes',
					'type'          => 'checkbox',
					'checkboxgroup' => 'end',
				),
				array(
					'title'       => __( 'Placeholder image', 'poocommerce' ),
					'id'          => 'poocommerce_placeholder_image',
					'type'        => 'text',
					'default'     => '',
					'class'       => '',
					'css'         => '',
					'placeholder' => __( 'Enter attachment ID or URL to an image', 'poocommerce' ),
					'desc_tip'    => __( 'This is the attachment ID, or image URL, used for placeholder images in the product catalog. Products with no image will use this.', 'poocommerce' ),
				),
				array(
					'type' => 'sectionend',
					'id'   => 'catalog_options',
				),

				array(
					'title' => __( 'Measurements', 'poocommerce' ),
					'type'  => 'title',
					'id'    => 'product_measurement_options',
				),

				array(
					'title'    => __( 'Weight unit', 'poocommerce' ),
					'desc'     => __( 'This controls what unit you will define weights in.', 'poocommerce' ),
					'id'       => 'poocommerce_weight_unit',
					'class'    => 'wc-enhanced-select',
					'css'      => 'min-width:300px;',
					'default'  => $default_weight_unit,
					'type'     => 'select',
					'options'  => array(
						'kg'  => I18nUtil::get_weight_unit_label( 'kg' ),
						'g'   => I18nUtil::get_weight_unit_label( 'g' ),
						'lbs' => I18nUtil::get_weight_unit_label( 'lbs' ),
						'oz'  => I18nUtil::get_weight_unit_label( 'oz' ),
					),
					'desc_tip' => true,
				),

				array(
					'title'    => __( 'Dimensions unit', 'poocommerce' ),
					'desc'     => __( 'This controls what unit you will define lengths in.', 'poocommerce' ),
					'id'       => 'poocommerce_dimension_unit',
					'class'    => 'wc-enhanced-select',
					'css'      => 'min-width:300px;',
					'default'  => $default_dimension_unit,
					'type'     => 'select',
					'options'  => array(
						'm'  => I18nUtil::get_dimensions_unit_label( 'm' ),
						'cm' => I18nUtil::get_dimensions_unit_label( 'cm' ),
						'mm' => I18nUtil::get_dimensions_unit_label( 'mm' ),
						'in' => I18nUtil::get_dimensions_unit_label( 'in' ),
						'yd' => I18nUtil::get_dimensions_unit_label( 'yd' ),
					),
					'desc_tip' => true,
				),

				array(
					'type' => 'sectionend',
					'id'   => 'product_measurement_options',
				),

				array(
					'title' => __( 'Reviews', 'poocommerce' ),
					'type'  => 'title',
					'desc'  => '',
					'id'    => 'product_rating_options',
				),

				array(
					'title'           => __( 'Enable reviews', 'poocommerce' ),
					'desc'            => __( 'Enable product reviews', 'poocommerce' ),
					'id'              => 'poocommerce_enable_reviews',
					'default'         => 'yes',
					'type'            => 'checkbox',
					'checkboxgroup'   => 'start',
					'show_if_checked' => 'option',
				),

				array(
					'desc'            => __( 'Show "verified owner" label on customer reviews', 'poocommerce' ),
					'id'              => 'poocommerce_review_rating_verification_label',
					'default'         => 'yes',
					'type'            => 'checkbox',
					'checkboxgroup'   => '',
					'show_if_checked' => 'yes',
					'autoload'        => false,
				),

				array(
					'desc'            => __( 'Reviews can only be left by "verified owners"', 'poocommerce' ),
					'id'              => 'poocommerce_review_rating_verification_required',
					'default'         => 'no',
					'type'            => 'checkbox',
					'checkboxgroup'   => 'end',
					'show_if_checked' => 'yes',
					'autoload'        => false,
				),

				array(
					'title'           => __( 'Product ratings', 'poocommerce' ),
					'desc'            => __( 'Enable star rating on reviews', 'poocommerce' ),
					'id'              => 'poocommerce_enable_review_rating',
					'default'         => 'yes',
					'type'            => 'checkbox',
					'checkboxgroup'   => 'start',
					'show_if_checked' => 'option',
				),

				array(
					'desc'            => __( 'Star ratings should be required, not optional', 'poocommerce' ),
					'id'              => 'poocommerce_review_rating_required',
					'default'         => 'yes',
					'type'            => 'checkbox',
					'checkboxgroup'   => 'end',
					'show_if_checked' => 'yes',
					'autoload'        => false,
				),

				array(
					'type' => 'sectionend',
					'id'   => 'product_rating_options',
				),
			);

		$settings = apply_filters( 'poocommerce_products_general_settings', $settings );
		return apply_filters( 'poocommerce_product_settings', $settings );
	}

	/**
	 * Get settings for the inventory section.
	 *
	 * @return array
	 */
	protected function get_settings_for_inventory_section() {
		$settings =
			array(
				array(
					'title' => __( 'Inventory', 'poocommerce' ),
					'type'  => 'title',
					'desc'  => '',
					'id'    => 'product_inventory_options',
				),

				array(
					'title'   => __( 'Manage stock', 'poocommerce' ),
					'desc'    => __( 'Enable stock management', 'poocommerce' ),
					'id'      => 'poocommerce_manage_stock',
					'default' => 'yes',
					'type'    => 'checkbox',
				),

				array(
					'title'             => __( 'Hold stock (minutes)', 'poocommerce' ),
					'desc'              => __( 'Hold stock (for unpaid orders) for x minutes. When this limit is reached, the pending order will be cancelled. Leave blank to disable.', 'poocommerce' ),
					'id'                => 'poocommerce_hold_stock_minutes',
					'type'              => 'number',
					'custom_attributes' => array(
						'min'  => 0,
						'step' => 1,
					),
					'css'               => 'width: 80px;',
					'default'           => '60',
					'autoload'          => false,
					'class'             => 'manage_stock_field',
				),

				array(
					'title'         => __( 'Notifications', 'poocommerce' ),
					'desc'          => __( 'Enable low stock notifications', 'poocommerce' ),
					'id'            => 'poocommerce_notify_low_stock',
					'default'       => 'yes',
					'type'          => 'checkbox',
					'checkboxgroup' => 'start',
					'autoload'      => false,
					'class'         => 'manage_stock_field',
				),

				array(
					'desc'          => __( 'Enable out of stock notifications', 'poocommerce' ),
					'id'            => 'poocommerce_notify_no_stock',
					'default'       => 'yes',
					'type'          => 'checkbox',
					'checkboxgroup' => 'end',
					'autoload'      => false,
					'class'         => 'manage_stock_field',
				),

				array(
					'title'    => __( 'Notification recipient(s)', 'poocommerce' ),
					'desc'     => __( 'Enter recipients (comma separated) that will receive this notification.', 'poocommerce' ),
					'id'       => 'poocommerce_stock_email_recipient',
					'type'     => 'text',
					'default'  => get_option( 'admin_email' ),
					'css'      => 'width: 250px;',
					'autoload' => false,
					'desc_tip' => true,
					'class'    => 'manage_stock_field',
				),

				array(
					'title'             => __( 'Low stock threshold', 'poocommerce' ),
					'desc'              => __( 'When product stock reaches this amount you will be notified via email.', 'poocommerce' ),
					'id'                => 'poocommerce_notify_low_stock_amount',
					'css'               => 'width:50px;',
					'type'              => 'number',
					'custom_attributes' => array(
						'min'  => 0,
						'step' => 1,
					),
					'default'           => '2',
					'autoload'          => false,
					'desc_tip'          => true,
					'class'             => 'manage_stock_field',
				),

				array(
					'title'             => __( 'Out of stock threshold', 'poocommerce' ),
					'desc'              => __( 'When product stock reaches this amount the stock status will change to "out of stock" and you will be notified via email. This setting does not affect existing "in stock" products.', 'poocommerce' ),
					'id'                => 'poocommerce_notify_no_stock_amount',
					'css'               => 'width:50px;',
					'type'              => 'number',
					'custom_attributes' => array(
						'min'  => 0,
						'step' => 1,
					),
					'default'           => '0',
					'desc_tip'          => true,
					'class'             => 'manage_stock_field',
				),

				array(
					'title'   => __( 'Out of stock visibility', 'poocommerce' ),
					'desc'    => __( 'Hide out of stock items from the catalog', 'poocommerce' ),
					'id'      => 'poocommerce_hide_out_of_stock_items',
					'default' => 'no',
					'type'    => 'checkbox',
				),

				array(
					'title'    => __( 'Stock display format', 'poocommerce' ),
					'desc'     => __( 'This controls how stock quantities are displayed on the frontend.', 'poocommerce' ),
					'id'       => 'poocommerce_stock_format',
					'css'      => 'min-width:150px;',
					'class'    => 'wc-enhanced-select',
					'default'  => '',
					'type'     => 'select',
					'options'  => array(
						''           => __( 'Always show quantity remaining in stock e.g. "12 in stock"', 'poocommerce' ),
						'low_amount' => __( 'Only show quantity remaining in stock when low e.g. "Only 2 left in stock"', 'poocommerce' ),
						'no_amount'  => __( 'Never show quantity remaining in stock', 'poocommerce' ),
					),
					'desc_tip' => true,
				),

				array(
					'type' => 'sectionend',
					'id'   => 'product_inventory_options',
				),
			);

		return apply_filters( 'poocommerce_inventory_settings', $settings );
	}

	/**
	 * Get settings for the downloadable section.
	 *
	 * @return array
	 */
	protected function get_settings_for_downloadable_section() {
		$settings =
			array(
				array(
					'title' => __( 'Downloadable products', 'poocommerce' ),
					'type'  => 'title',
					'id'    => 'digital_download_options',
				),

				array(
					'title'    => __( 'File download method', 'poocommerce' ),
					'desc_tip' => sprintf(
					/* translators: 1: X-Accel-Redirect 2: X-Sendfile 3: mod_xsendfile */
						__( 'Forcing downloads will keep URLs hidden, but some servers may serve large files unreliably. If supported, %1$s / %2$s can be used to serve downloads instead (server requires %3$s).', 'poocommerce' ),
						'<code>X-Accel-Redirect</code>',
						'<code>X-Sendfile</code>',
						'<code>mod_xsendfile</code>'
					),
					'id'       => 'poocommerce_file_download_method',
					'type'     => 'select',
					'class'    => 'wc-enhanced-select',
					'css'      => 'min-width:300px;',
					'default'  => 'force',
					'desc'     => sprintf(
					// translators: Link to PooCommerce Docs.
						__( "If you are using X-Accel-Redirect download method along with NGINX server, make sure that you have applied settings as described in <a href='%s'>Digital/Downloadable Product Handling</a> guide.", 'poocommerce' ),
						'https://poocommerce.com/document/digital-downloadable-product-handling#nginx-setting'
					),
					'options'  => array(
						'force'     => __( 'Force downloads', 'poocommerce' ),
						'xsendfile' => __( 'X-Accel-Redirect/X-Sendfile', 'poocommerce' ),
						'redirect'  => apply_filters( 'poocommerce_redirect_only_method_is_secure', false ) ? __( 'Redirect only', 'poocommerce' ) : __( 'Redirect only (Insecure)', 'poocommerce' ),
					),
					'autoload' => false,
				),

				array(
					'desc'          => __( 'Allow using redirect mode (insecure) as a last resort', 'poocommerce' ),
					'id'            => 'poocommerce_downloads_redirect_fallback_allowed',
					'type'          => 'checkbox',
					'default'       => 'no',
					'desc_tip'      => sprintf(
						/* translators: %1$s is a link to the PooCommerce documentation. */
						__( 'If the "Force Downloads" or "X-Accel-Redirect/X-Sendfile" download method is selected but does not work, the system will use the "Redirect" method as a last resort. <a href="%1$s">See this guide</a> for more details.', 'poocommerce' ),
						'https://poocommerce.com/document/digital-downloadable-product-handling/'
					),
					'checkboxgroup' => 'start',
					'autoload'      => false,
				),

				array(
					'title'         => __( 'Access restriction', 'poocommerce' ),
					'desc'          => __( 'Downloads require login', 'poocommerce' ),
					'id'            => 'poocommerce_downloads_require_login',
					'type'          => 'checkbox',
					'default'       => 'no',
					'desc_tip'      => __( 'This setting does not apply to guest purchases.', 'poocommerce' ),
					'checkboxgroup' => 'start',
					'autoload'      => false,
				),

				array(
					'desc'          => __( 'Grant access to downloadable products after payment', 'poocommerce' ),
					'id'            => 'poocommerce_downloads_grant_access_after_payment',
					'type'          => 'checkbox',
					'default'       => 'yes',
					'desc_tip'      => __( 'Enable this option to grant access to downloads when orders are "processing", rather than "completed".', 'poocommerce' ),
					'checkboxgroup' => 'end',
					'autoload'      => false,
				),

				array(
					'title'    => __( 'Open in browser', 'poocommerce' ),
					'desc'     => __( 'Open downloadable files in the browser, instead of saving them to the device.', 'poocommerce' ),
					'id'       => 'poocommerce_downloads_deliver_inline',
					'type'     => 'checkbox',
					'default'  => false,
					'desc_tip' => __( 'Customers can still save the file to their device, but by default file will be opened instead of being downloaded (does not work with redirects).', 'poocommerce' ),
					'autoload' => false,
				),

				array(
					'title'    => __( 'Filename', 'poocommerce' ),
					'desc'     => __( 'Append a unique string to filename for security', 'poocommerce' ),
					'id'       => 'poocommerce_downloads_add_hash_to_filename',
					'type'     => 'checkbox',
					'default'  => 'yes',
					'desc_tip' => sprintf(
					// translators: Link to PooCommerce Docs.
						__( "Not required if your download directory is protected. <a href='%s'>See this guide</a> for more details. Files already uploaded will not be affected.", 'poocommerce' ),
						'https://poocommerce.com/document/digital-downloadable-product-handling#unique-string'
					),
				),

				array(
					'title'    => __( 'Count partial downloads', 'poocommerce' ),
					'desc'     => __( 'Count downloads even if only part of a file is fetched.', 'poocommerce' ),
					'id'       => 'poocommerce_downloads_count_partial',
					'type'     => 'checkbox',
					'default'  => 'yes',
					'desc_tip' => sprintf(
						/* Translators: 1: opening link tag 2: closing link tag. */
						__( 'Repeat fetches made within a reasonable window of time (by default, 30 minutes) will not be counted twice. This is a generally reasonably way to enforce download limits in relation to ranged requests. %1$sLearn more.%2$s', 'poocommerce' ),
						'<a href="https://poocommerce.com/document/digital-downloadable-product-handling/">',
						'</a>'
					),
				),

				array(
					'type' => 'sectionend',
					'id'   => 'digital_download_options',
				),
			);

		return apply_filters( 'poocommerce_downloadable_products_settings', $settings );
	}

	/**
	 * Save settings and trigger the 'poocommerce_update_options_'.id action.
	 */
	public function save() {
		$this->save_settings_for_current_section();

		/*
		 * Product->Inventory has a setting `Out of stock visibility`.
		 * Because of this, we need to recount the terms to keep them in-sync.
		 */
		WC()->call_function( 'wc_recount_all_terms' );

		$this->do_update_options_action();
	}
}

return new WC_Settings_Products();
