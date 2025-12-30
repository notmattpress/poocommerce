/**
 * Internal dependencies
 */
import { BlueprintStep } from './types';

const OPTIONS_GROUPS = {
	poocommerce_store_address: 'General',
	poocommerce_store_address_2: 'General',
	poocommerce_store_city: 'General',
	poocommerce_default_country: 'General',
	poocommerce_store_postcode: 'General',
	poocommerce_allowed_countries: 'General',
	poocommerce_all_except_countries: 'General',
	poocommerce_specific_allowed_countries: 'General',
	poocommerce_ship_to_countries: 'General',
	poocommerce_specific_ship_to_countries: 'General',
	poocommerce_default_customer_address: 'General',
	poocommerce_calc_taxes: 'General',
	poocommerce_enable_coupons: 'General',
	poocommerce_calc_discounts_sequentially: 'General',
	poocommerce_currency: 'General',
	poocommerce_currency_pos: 'General',
	poocommerce_price_thousand_sep: 'General',
	poocommerce_price_decimal_sep: 'General',
	poocommerce_price_num_decimals: 'General',
	poocommerce_shop_page_id: 'Products',
	poocommerce_cart_redirect_after_add: 'Products',
	poocommerce_enable_ajax_add_to_cart: 'Products',
	poocommerce_placeholder_image: 'Products',
	poocommerce_weight_unit: 'Products',
	poocommerce_dimension_unit: 'Products',
	poocommerce_enable_reviews: 'Products',
	poocommerce_review_rating_verification_label: 'Products',
	poocommerce_review_rating_verification_required: 'Products',
	poocommerce_enable_review_rating: 'Products',
	poocommerce_review_rating_required: 'Products',
	poocommerce_manage_stock: 'Products',
	poocommerce_hold_stock_minutes: 'Products',
	poocommerce_notify_low_stock: 'Products',
	poocommerce_notify_no_stock: 'Products',
	poocommerce_stock_email_recipient: 'Products',
	poocommerce_notify_low_stock_amount: 'Products',
	poocommerce_notify_no_stock_amount: 'Products',
	poocommerce_hide_out_of_stock_items: 'Products',
	poocommerce_stock_format: 'Products',
	poocommerce_file_download_method: 'Products',
	poocommerce_downloads_redirect_fallback_allowed: 'Products',
	poocommerce_downloads_require_login: 'Products',
	poocommerce_downloads_grant_access_after_payment: 'Products',
	poocommerce_downloads_deliver_inline: 'Products',
	poocommerce_downloads_add_hash_to_filename: 'Products',
	poocommerce_downloads_count_partial: 'Products',
	poocommerce_attribute_lookup_enabled: 'Products',
	poocommerce_attribute_lookup_direct_updates: 'Products',
	poocommerce_attribute_lookup_optimized_updates: 'Products',
	poocommerce_product_match_featured_image_by_sku: 'Products',
	poocommerce_bacs_settings: 'Payments',
	poocommerce_cheque_settings: 'Payments',
	poocommerce_cod_settings: 'Payments',
	poocommerce_enable_guest_checkout: 'Accounts',
	poocommerce_enable_checkout_login_reminder: 'Accounts',
	poocommerce_enable_delayed_account_creation: 'Accounts',
	poocommerce_enable_signup_and_login_from_checkout: 'Accounts',
	poocommerce_enable_myaccount_registration: 'Accounts',
	poocommerce_registration_generate_password: 'Accounts',
	poocommerce_erasure_request_removes_order_data: 'Accounts',
	poocommerce_erasure_request_removes_download_data: 'Accounts',
	poocommerce_allow_bulk_remove_personal_data: 'Accounts',
	poocommerce_registration_privacy_policy_text: 'Accounts',
	poocommerce_checkout_privacy_policy_text: 'Accounts',
	poocommerce_delete_inactive_accounts: 'Accounts',
	poocommerce_trash_pending_orders: 'Accounts',
	poocommerce_trash_failed_orders: 'Accounts',
	poocommerce_trash_cancelled_orders: 'Accounts',
	poocommerce_anonymize_refunded_orders: 'Accounts',
	poocommerce_anonymize_completed_orders: 'Accounts',
	poocommerce_email_from_name: 'Emails',
	poocommerce_email_from_address: 'Emails',
	poocommerce_email_header_image: 'Emails',
	poocommerce_email_base_color: 'Emails',
	poocommerce_email_background_color: 'Emails',
	poocommerce_email_body_background_color: 'Emails',
	poocommerce_email_text_color: 'Emails',
	poocommerce_email_footer_text: 'Emails',
	poocommerce_email_footer_text_color: 'Emails',
	poocommerce_email_auto_sync_with_theme: 'Emails',
	poocommerce_merchant_email_notifications: 'Emails',
	poocommerce_coming_soon: 'Site visibility',
	poocommerce_store_pages_only: 'Site visibility',
	poocommerce_cart_page_id: 'Advanced',
	poocommerce_checkout_page_id: 'Advanced',
	poocommerce_myaccount_page_id: 'Advanced',
	poocommerce_terms_page_id: 'Advanced',
	poocommerce_checkout_pay_endpoint: 'Advanced',
	poocommerce_checkout_order_received_endpoint: 'Advanced',
	poocommerce_myaccount_add_payment_method_endpoint: 'Advanced',
	poocommerce_myaccount_delete_payment_method_endpoint: 'Advanced',
	poocommerce_myaccount_set_default_payment_method_endpoint: 'Advanced',
	poocommerce_myaccount_orders_endpoint: 'Advanced',
	poocommerce_myaccount_view_order_endpoint: 'Advanced',
	poocommerce_myaccount_downloads_endpoint: 'Advanced',
	poocommerce_myaccount_edit_account_endpoint: 'Advanced',
	poocommerce_myaccount_edit_address_endpoint: 'Advanced',
	poocommerce_myaccount_payment_methods_endpoint: 'Advanced',
	poocommerce_myaccount_lost_password_endpoint: 'Advanced',
	poocommerce_logout_endpoint: 'Advanced',
	poocommerce_api_enabled: 'Advanced',
	poocommerce_allow_tracking: 'Advanced',
	poocommerce_show_marketplace_suggestions: 'Advanced',
	poocommerce_custom_orders_table_enabled: 'Advanced',
	poocommerce_custom_orders_table_data_sync_enabled: 'Advanced',
	poocommerce_analytics_enabled: 'Advanced',
	poocommerce_feature_rate_limit_checkout_enabled: 'Advanced',
	poocommerce_feature_order_attribution_enabled: 'Advanced',
	poocommerce_feature_site_visibility_badge_enabled: 'Advanced',
	poocommerce_feature_remote_logging_enabled: 'Advanced',
	poocommerce_feature_email_improvements_enabled: 'Advanced',
	poocommerce_feature_blueprint_enabled: 'Advanced',
	poocommerce_feature_product_block_editor_enabled: 'Advanced',
	poocommerce_hpos_fts_index_enabled: 'Advanced',
	poocommerce_feature_cost_of_goods_sold_enabled: 'Advanced',
};
/**
 * Get option groups from options
 *
 * Takes a list of options and return the groups they belong to.
 *
 * In this context, groups are the sections in the settings page (e.g. General, Products, Payments, etc).
 *
 * @param options a list of options
 * @return string[] a list of groups
 */
export const getOptionGroups = ( options: string[] ) => {
	const groups = new Set();
	options.forEach( ( option ) => {
		if ( OPTIONS_GROUPS[ option as keyof typeof OPTIONS_GROUPS ] ) {
			groups.add(
				OPTIONS_GROUPS[ option as keyof typeof OPTIONS_GROUPS ]
			);
		}
	} );
	return Array.from( groups );
};

/**
 * Take an array of Blueprint steps, filter `setSiteOptions` steps and return the groups of options
 *
 * @param steps a list of Blueprint steps
 * @return string[] a list of groups
 */
export const getOptionGroupsFromSteps = (
	steps: ( BlueprintStep & { options?: Record< string, string > } )[]
) => {
	const options = steps.reduce< string[] >( ( acc, step ) => {
		if ( step.step === 'setSiteOptions' && step.options ) {
			acc.push( ...Object.keys( step.options ) );
		}
		return acc;
	}, [] );

	return getOptionGroups( options );
};
