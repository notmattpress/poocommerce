<?php
/**
 * Connect existing PooCommerce pages to PooCommerce Admin.
 *
 * @package PooCommerce\Admin
 */

use Automattic\PooCommerce\Admin\PageController;
use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Utilities\OrderUtil;

/**
 * Returns core WC pages to connect to WC-Admin.
 *
 * @return array
 */
function wc_admin_get_core_pages_to_connect() {
	$all_reports = WC_Admin_Reports::get_reports();
	$report_tabs = array();

	foreach ( $all_reports as $report_id => $report_data ) {
		$report_tabs[ $report_id ] = $report_data['title'];
	}

	return array(
		'wc-addons'   => array(
			'title' => __( 'Extensions', 'poocommerce' ),
			'tabs'  => array(),
		),
		'wc-reports'  => array(
			'title' => __( 'Reports', 'poocommerce' ),
			'tabs'  => $report_tabs,
		),
		'wc-settings' => array(
			'title' => __( 'Settings', 'poocommerce' ),
			'tabs'  => apply_filters( 'poocommerce_settings_tabs_array', array() ), // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
		),
		'wc-status'   => array(
			'title' => __( 'Status', 'poocommerce' ),
			// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
			'tabs'  => apply_filters(
				'poocommerce_admin_status_tabs',
				array(
					'status' => __( 'System status', 'poocommerce' ),
					'tools'  => __( 'Tools', 'poocommerce' ),
					'logs'   => __( 'Logs', 'poocommerce' ),
				)
			),
		),
	);
}

/**
 * Filter breadcrumbs for core pages that aren't explicitly connected.
 *
 * @param array $breadcrumbs Breadcrumb pieces.
 * @return array Filtered breadcrumb pieces.
 */
function wc_admin_filter_core_page_breadcrumbs( $breadcrumbs ) {
	$screen_id              = PageController::get_instance()->get_current_screen_id();
	$pages_to_connect       = wc_admin_get_core_pages_to_connect();
	$poocommerce_breadcrumb = array(
		'admin.php?page=wc-admin',
		__( 'PooCommerce', 'poocommerce' ),
	);

	foreach ( $pages_to_connect as $page_id => $page_data ) {
		if ( preg_match( "/^poocommerce_page_{$page_id}\-/", $screen_id ) ) {
			if ( empty( $page_data['tabs'] ) ) {
				$new_breadcrumbs = array(
					$poocommerce_breadcrumb,
					$page_data['title'],
				);
			} else {
				$new_breadcrumbs = array(
					$poocommerce_breadcrumb,
					array(
						add_query_arg( 'page', $page_id, 'admin.php' ),
						$page_data['title'],
					),
				);

				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				if ( isset( $_GET['tab'] ) ) {
					// phpcs:ignore WordPress.Security.NonceVerification.Recommended
					$current_tab = wc_clean( wp_unslash( $_GET['tab'] ) );
				} else {
					$current_tab = key( $page_data['tabs'] );
				}

				$new_breadcrumbs[] = $page_data['tabs'][ $current_tab ];
			}

			return $new_breadcrumbs;
		}
	}

	return $breadcrumbs;
}

/**
 * Render the WC-Admin header bar on all PooCommerce core pages.
 *
 * @param bool $is_connected Whether the current page is connected.
 * @param bool $current_page The current page, if connected.
 * @return bool Whether to connect the page.
 */
function wc_admin_connect_core_pages( $is_connected, $current_page ) {
	if ( false === $is_connected && false === $current_page ) {
		$screen_id        = PageController::get_instance()->get_current_screen_id();
		$pages_to_connect = wc_admin_get_core_pages_to_connect();

		foreach ( $pages_to_connect as $page_id => $page_data ) {
			if ( preg_match( "/^poocommerce_page_{$page_id}\-/", $screen_id ) ) {
				add_filter( 'poocommerce_navigation_get_breadcrumbs', 'wc_admin_filter_core_page_breadcrumbs' );

				return true;
			}
		}
	}

	return $is_connected;
}

add_filter( 'poocommerce_navigation_is_connected_page', 'wc_admin_connect_core_pages', 10, 2 );

$posttype_list_base = 'edit.php';

// PooCommerce > Orders.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-orders',
		'screen_id' => 'edit-shop_order',
		'title'     => __( 'Orders', 'poocommerce' ),
		'path'      => add_query_arg( 'post_type', 'shop_order', $posttype_list_base ),
	)
);

// PooCommerce > Orders > Add New.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-add-order',
		'parent'    => 'poocommerce-orders',
		'screen_id' => 'shop_order-add',
		'title'     => __( 'Add New', 'poocommerce' ),
	)
);

// PooCommerce > Orders > Edit Order.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-edit-order',
		'parent'    => 'poocommerce-orders',
		'screen_id' => 'shop_order',
		'title'     => __( 'Edit Order', 'poocommerce' ),
	)
);

if ( OrderUtil::custom_orders_table_usage_is_enabled() ) {
	// PooCommerce > Orders (COT).
	wc_admin_connect_page(
		array(
			'id'        => 'poocommerce-custom-orders',
			'screen_id' => wc_get_page_screen_id( 'shop-order' ),
			'title'     => __( 'Orders', 'poocommerce' ),
			'path'      => 'admin.php?page=wc-orders',
		)
	);
}

// PooCommerce > Coupons.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-coupons',
		'parent'    => Features::is_enabled( 'coupons' ) ? 'poocommerce-marketing' : null,
		'screen_id' => 'edit-shop_coupon',
		'title'     => __( 'Coupons', 'poocommerce' ),
		'path'      => add_query_arg( 'post_type', 'shop_coupon', $posttype_list_base ),
	)
);

// PooCommerce > Coupons > Add New.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-add-coupon',
		'parent'    => 'poocommerce-coupons',
		'screen_id' => 'shop_coupon-add',
		'title'     => __( 'Add New', 'poocommerce' ),
	)
);

// PooCommerce > Coupons > Edit Coupon.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-edit-coupon',
		'parent'    => 'poocommerce-coupons',
		'screen_id' => 'shop_coupon',
		'title'     => __( 'Edit Coupon', 'poocommerce' ),
	)
);

// PooCommerce > Products.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-products',
		'screen_id' => 'edit-product',
		'title'     => __( 'Products', 'poocommerce' ),
		'path'      => add_query_arg( 'post_type', 'product', $posttype_list_base ),
	)
);

// PooCommerce > Products > Add New.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-add-product',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product-add',
		'title'     => __( 'Add New', 'poocommerce' ),
	)
);

// PooCommerce > Products > Edit Order.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-edit-product',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product',
		'title'     => __( 'Edit Product', 'poocommerce' ),
	)
);

// PooCommerce > Products > Import Products.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-import-products',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product_page_product_importer',
		'title'     => __( 'Import Products', 'poocommerce' ),
	)
);

// PooCommerce > Products > Export Products.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-export-products',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product_page_product_exporter',
		'title'     => __( 'Export Products', 'poocommerce' ),
	)
);

// PooCommerce > Products > Product categories.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-product-categories',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'edit-product_cat',
		'title'     => __( 'Product categories', 'poocommerce' ),
	)
);

// PooCommerce > Products > Edit category.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-product-edit-category',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product_cat',
		'title'     => __( 'Edit category', 'poocommerce' ),
	)
);

// PooCommerce > Products > Product tags.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-product-tags',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'edit-product_tag',
		'title'     => __( 'Product tags', 'poocommerce' ),
	)
);

// PooCommerce > Products > Edit tag.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-product-edit-tag',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product_tag',
		'title'     => __( 'Edit tag', 'poocommerce' ),
	)
);

// PooCommerce > Products > Attributes.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-product-attributes',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product_page_product_attributes',
		'title'     => __( 'Attributes', 'poocommerce' ),
	)
);

// PooCommerce > Products > Edit attribute.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-product-edit-attribute',
		'parent'    => 'poocommerce-products',
		'screen_id' => 'product_page_product_attribute-edit',
		'title'     => __( 'Edit attribute', 'poocommerce' ),
	)
);
