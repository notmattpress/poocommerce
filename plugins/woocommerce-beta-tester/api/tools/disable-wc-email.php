<?php

defined( 'ABSPATH' ) || exit;

register_poocommerce_admin_test_helper_rest_route(
	'/tools/toggle-emails/v1',
	'toggle_emails'
);

register_poocommerce_admin_test_helper_rest_route(
	'/tools/get-email-status/v1',
	'get_email_status',
	array(
		'methods' => 'GET',
	)
);

/**
 * A tool to toggle all PooCommerce emails.
 */
function toggle_emails() {
	$emails_disabled = 'yes';
	if ( get_option( 'wc_admin_test_helper_email_disabled', 'no' ) === $emails_disabled ) {
		$emails_disabled = 'no';
		remove_filter( 'poocommerce_email_get_option', 'disable_wc_emails' );
	}
	update_option( 'wc_admin_test_helper_email_disabled', $emails_disabled );
	return new WP_REST_Response( $emails_disabled, 200 );
}

/**
 * A tool to get the status of the PooCommerce emails option.
 */
function get_email_status() {
	$emails_disabled = get_option( 'wc_admin_test_helper_email_disabled', 'no' );
	return new WP_REST_Response( $emails_disabled, 200 );
}

if ( 'yes' === get_option( 'wc_admin_test_helper_email_disabled', 'no' ) ) {
	add_filter( 'poocommerce_email_get_option', 'disable_wc_emails' );
	add_action( 'poocommerce_email', 'unhook_other_wc_emails' );
}

/**
 * A hook for filtering the disabling of PooCommerce emails.
 *
 * @param string $key The email option key.
 */
function disable_wc_emails( $key ) {
	if ( 'enabled' === $key ) {
		return false;
	}
}

/**
 * Unhooks PooCommerce emails.
 *
 * @param Object $email The email object.
 */
function unhook_other_wc_emails( $email ) {
	remove_action( 'poocommerce_low_stock_notification', array( $email, 'low_stock' ) );
	remove_action( 'poocommerce_no_stock_notification', array( $email, 'no_stock' ) );
	remove_action( 'poocommerce_product_on_backorder_notification', array( $email, 'backorder' ) );
	remove_action( 'poocommerce_new_customer_note_notification', array( $email->emails['WC_Email_Customer_Note'], 'trigger' ) );
}
