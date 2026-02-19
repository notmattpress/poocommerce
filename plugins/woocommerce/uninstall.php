<?php
/**
 * PooCommerce Uninstall
 *
 * Uninstalling PooCommerce deletes user roles, pages, tables, and options.
 *
 * @package PooCommerce\Uninstaller
 * @version 2.3.0
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb, $wp_version, $wc_uninstalling_plugin;

$wc_uninstalling_plugin = true;

// Clear WordPress cron events.
wp_clear_scheduled_hook( 'poocommerce_scheduled_sales' );
wp_clear_scheduled_hook( 'poocommerce_cancel_unpaid_orders' );
wp_clear_scheduled_hook( 'poocommerce_cleanup_sessions' );
wp_clear_scheduled_hook( 'poocommerce_cleanup_personal_data' );
wp_clear_scheduled_hook( 'poocommerce_cleanup_logs' );
wp_clear_scheduled_hook( 'poocommerce_geoip_updater' );
wp_clear_scheduled_hook( 'poocommerce_tracker_send_event' );
wp_clear_scheduled_hook( 'poocommerce_cleanup_rate_limits' );
wp_clear_scheduled_hook( 'wc_admin_daily' );
wp_clear_scheduled_hook( 'generate_category_lookup_table' );
wp_clear_scheduled_hook( 'wc_admin_unsnooze_admin_notes' );

if ( class_exists( ActionScheduler::class ) && ActionScheduler::is_initialized() && function_exists( 'as_unschedule_all_actions' ) ) {
	as_unschedule_all_actions( 'poocommerce_scheduled_sales' );
	as_unschedule_all_actions( 'poocommerce_cancel_unpaid_orders' );
	as_unschedule_all_actions( 'poocommerce_cleanup_sessions' );
	as_unschedule_all_actions( 'poocommerce_cleanup_personal_data' );
	as_unschedule_all_actions( 'poocommerce_cleanup_logs' );
	as_unschedule_all_actions( 'poocommerce_geoip_updater' );
	as_unschedule_all_actions( 'poocommerce_tracker_send_event' );
	as_unschedule_all_actions( 'poocommerce_cleanup_rate_limits' );
	as_unschedule_all_actions( 'wc_admin_daily' );
	as_unschedule_all_actions( 'generate_category_lookup_table' );
	as_unschedule_all_actions( 'wc_admin_unsnooze_admin_notes' );
}

/*
 * Only remove ALL product and page data if WC_REMOVE_ALL_DATA constant is set to true in user's
 * wp-config.php. This is to prevent data loss when deleting the plugin from the backend
 * and to ensure only the site owner can perform this action.
 */
if ( defined( 'WC_REMOVE_ALL_DATA' ) && true === WC_REMOVE_ALL_DATA ) {
	// Load PooCommerce so we can access the container, install routines, etc, during uninstall.
	require_once __DIR__ . '/includes/class-wc-install.php';

	// Drop custom WordPress tables indexes. See \WC_Install::create_tables() for details.
	$index_exists = $wpdb->get_row( "SHOW INDEX FROM {$wpdb->comments} WHERE key_name = 'woo_idx_comment_type';" );
	if ( null !== $index_exists ) {
		$wpdb->query( "ALTER TABLE {$wpdb->comments} DROP INDEX woo_idx_comment_type;" );
	}
	$date_type_index_exists = $wpdb->get_row( "SHOW INDEX FROM {$wpdb->comments} WHERE key_name = 'woo_idx_comment_date_type';" );
	if ( null !== $date_type_index_exists ) {
		$wpdb->query( "ALTER TABLE {$wpdb->comments} DROP INDEX woo_idx_comment_date_type;" );
	}
	$comment_approved_type_index_exists = $wpdb->get_row( "SHOW INDEX FROM {$wpdb->comments} WHERE key_name = 'woo_idx_comment_approved_type';" );
	if ( null !== $comment_approved_type_index_exists ) {
		$wpdb->query( "ALTER TABLE {$wpdb->comments} DROP INDEX woo_idx_comment_approved_type;" );
	}

	// Roles + caps.
	WC_Install::remove_roles();

	// Pages.
	wp_trash_post( get_option( 'poocommerce_shop_page_id' ) );
	wp_trash_post( get_option( 'poocommerce_cart_page_id' ) );
	wp_trash_post( get_option( 'poocommerce_checkout_page_id' ) );
	wp_trash_post( get_option( 'poocommerce_myaccount_page_id' ) );
	wp_trash_post( get_option( 'poocommerce_edit_address_page_id' ) );
	wp_trash_post( get_option( 'poocommerce_view_order_page_id' ) );
	wp_trash_post( get_option( 'poocommerce_change_password_page_id' ) );
	wp_trash_post( get_option( 'poocommerce_logout_page_id' ) );

	if ( $wpdb->get_var( "SHOW TABLES LIKE '{$wpdb->prefix}poocommerce_attribute_taxonomies';" ) ) {
		$wc_attributes = array_filter( (array) $wpdb->get_col( "SELECT attribute_name FROM {$wpdb->prefix}poocommerce_attribute_taxonomies;" ) );
	} else {
		$wc_attributes = array();
	}

	// Tables.
	WC_Install::drop_tables();

	// Delete options.
	$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE 'poocommerce\_%';" );
	$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE 'widget\_poocommerce\_%';" );

	// Delete usermeta.
	$wpdb->query( "DELETE FROM $wpdb->usermeta WHERE meta_key LIKE 'poocommerce\_%';" );

	// Delete our data from the post and post meta tables, and remove any additional tables we created.
	$wpdb->query( "DELETE FROM {$wpdb->posts} WHERE post_type IN ( 'product', 'product_variation', 'shop_coupon', 'shop_order', 'shop_order_refund' );" );
	$wpdb->query( "DELETE meta FROM {$wpdb->postmeta} meta LEFT JOIN {$wpdb->posts} posts ON posts.ID = meta.post_id WHERE posts.ID IS NULL;" );

	$wpdb->query( "DELETE FROM {$wpdb->comments} WHERE comment_type IN ( 'order_note' );" );
	$wpdb->query( "DELETE meta FROM {$wpdb->commentmeta} meta LEFT JOIN {$wpdb->comments} comments ON comments.comment_ID = meta.comment_id WHERE comments.comment_ID IS NULL;" );

	// Delete terms if > WP 4.2 (term splitting was added in 4.2).
	if ( version_compare( $wp_version, '4.2', '>=' ) ) {
		// Delete term taxonomies.
		foreach ( array( 'product_cat', 'product_tag', 'product_shipping_class', 'product_type' ) as $_taxonomy ) {
			$wpdb->delete(
				$wpdb->term_taxonomy,
				array(
					'taxonomy' => $_taxonomy,
				)
			);
		}

		// Delete term attributes.
		foreach ( $wc_attributes as $_taxonomy ) {
			$wpdb->delete(
				$wpdb->term_taxonomy,
				array(
					'taxonomy' => 'pa_' . $_taxonomy,
				)
			);
		}

		// Delete orphan relationships.
		$wpdb->query( "DELETE tr FROM {$wpdb->term_relationships} tr LEFT JOIN {$wpdb->posts} posts ON posts.ID = tr.object_id WHERE posts.ID IS NULL;" );

		// Delete orphan terms.
		$wpdb->query( "DELETE t FROM {$wpdb->terms} t LEFT JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id WHERE tt.term_id IS NULL;" );

		// Delete orphan term meta.
		if ( ! empty( $wpdb->termmeta ) ) {
			$wpdb->query( "DELETE tm FROM {$wpdb->termmeta} tm LEFT JOIN {$wpdb->term_taxonomy} tt ON tm.term_id = tt.term_id WHERE tt.term_id IS NULL;" );
		}
	}

	// Clear any cached data that has been removed.
	wp_cache_flush();
}

unset( $wc_uninstalling_plugin );
