<?php
/**
 * PooCommerce Template Hooks
 *
 * Action/filter hooks used for PooCommerce functions/templates.
 *
 * @package PooCommerce\Templates
 * @version 2.1.0
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'body_class', 'wc_body_class' );
add_filter( 'post_class', 'wc_product_post_class', 20, 3 );

/**
 * WP Header.
 *
 * @see wc_generator_tag()
 */
add_filter( 'get_the_generator_html', 'wc_generator_tag', 10, 2 );
add_filter( 'get_the_generator_xhtml', 'wc_generator_tag', 10, 2 );

/**
 * Content Wrappers.
 *
 * @see poocommerce_output_content_wrapper()
 * @see poocommerce_output_content_wrapper_end()
 */
add_action( 'poocommerce_before_main_content', 'poocommerce_output_content_wrapper', 10 );
add_action( 'poocommerce_after_main_content', 'poocommerce_output_content_wrapper_end', 10 );

/**
 * Sale flashes.
 *
 * @see poocommerce_show_product_loop_sale_flash()
 * @see poocommerce_show_product_sale_flash()
 */
add_action( 'poocommerce_before_shop_loop_item_title', 'poocommerce_show_product_loop_sale_flash', 10 );
add_action( 'poocommerce_before_single_product_summary', 'poocommerce_show_product_sale_flash', 10 );

/**
 * Breadcrumbs.
 *
 * @see poocommerce_breadcrumb()
 */
add_action( 'poocommerce_before_main_content', 'poocommerce_breadcrumb', 20, 0 );

/**
 * Sidebar.
 *
 * @see poocommerce_get_sidebar()
 */
add_action( 'poocommerce_sidebar', 'poocommerce_get_sidebar', 10 );

/**
 * Archive header.
 *
 * @see poocommerce_product_taxonomy_archive_header()
 */
add_action( 'poocommerce_shop_loop_header', 'poocommerce_product_taxonomy_archive_header' );

/**
 * Archive descriptions.
 *
 * @see poocommerce_taxonomy_archive_description()
 * @see poocommerce_product_archive_description()
 */
add_action( 'poocommerce_archive_description', 'poocommerce_taxonomy_archive_description', 10 );
add_action( 'poocommerce_archive_description', 'poocommerce_product_archive_description', 10 );

/**
 * Product loop start.
 */
add_filter( 'poocommerce_product_loop_start', 'poocommerce_maybe_show_product_subcategories' );

/**
 * Products Loop.
 *
 * @see poocommerce_result_count()
 * @see poocommerce_catalog_ordering()
 */
add_action( 'poocommerce_before_shop_loop', 'poocommerce_result_count', 20 );
add_action( 'poocommerce_before_shop_loop', 'poocommerce_catalog_ordering', 30 );
add_action( 'poocommerce_no_products_found', 'wc_no_products_found' );

/**
 * Product Loop Items.
 *
 * @see poocommerce_template_loop_product_link_open()
 * @see poocommerce_template_loop_product_link_close()
 * @see poocommerce_template_loop_add_to_cart()
 * @see poocommerce_template_loop_product_thumbnail()
 * @see poocommerce_template_loop_product_title()
 * @see poocommerce_template_loop_category_link_open()
 * @see poocommerce_template_loop_category_title()
 * @see poocommerce_template_loop_category_link_close()
 * @see poocommerce_template_loop_price()
 * @see poocommerce_template_loop_rating()
 */
add_action( 'poocommerce_before_shop_loop_item', 'poocommerce_template_loop_product_link_open', 10 );
add_action( 'poocommerce_after_shop_loop_item', 'poocommerce_template_loop_product_link_close', 5 );
add_action( 'poocommerce_after_shop_loop_item', 'poocommerce_template_loop_add_to_cart', 10 );
add_action( 'poocommerce_before_shop_loop_item_title', 'poocommerce_template_loop_product_thumbnail', 10 );
add_action( 'poocommerce_shop_loop_item_title', 'poocommerce_template_loop_product_title', 10 );

add_action( 'poocommerce_before_subcategory', 'poocommerce_template_loop_category_link_open', 10 );
add_action( 'poocommerce_shop_loop_subcategory_title', 'poocommerce_template_loop_category_title', 10 );
add_action( 'poocommerce_after_subcategory', 'poocommerce_template_loop_category_link_close', 10 );

add_action( 'poocommerce_after_shop_loop_item_title', 'poocommerce_template_loop_price', 10 );
add_action( 'poocommerce_after_shop_loop_item_title', 'poocommerce_template_loop_rating', 5 );

/**
 * Subcategories.
 *
 * @see poocommerce_subcategory_thumbnail()
 */
add_action( 'poocommerce_before_subcategory_title', 'poocommerce_subcategory_thumbnail', 10 );

/**
 * Before Single Products Summary Div.
 *
 * @see poocommerce_show_product_images()
 * @see poocommerce_show_product_thumbnails()
 */
add_action( 'poocommerce_before_single_product_summary', 'poocommerce_show_product_images', 20 );
add_action( 'poocommerce_product_thumbnails', 'poocommerce_show_product_thumbnails', 20 );

/**
 * After Single Products Summary Div.
 *
 * @see poocommerce_output_product_data_tabs()
 * @see poocommerce_upsell_display()
 * @see poocommerce_output_related_products()
 */
add_action( 'poocommerce_after_single_product_summary', 'poocommerce_output_product_data_tabs', 10 );
add_action( 'poocommerce_after_single_product_summary', 'poocommerce_upsell_display', 15 );
add_action( 'poocommerce_after_single_product_summary', 'poocommerce_output_related_products', 20 );

/**
 * Product Summary Box.
 *
 * @see poocommerce_template_single_title()
 * @see poocommerce_template_single_rating()
 * @see poocommerce_template_single_price()
 * @see poocommerce_template_single_excerpt()
 * @see poocommerce_template_single_meta()
 * @see poocommerce_template_single_sharing()
 */
add_action( 'poocommerce_single_product_summary', 'poocommerce_template_single_title', 5 );
add_action( 'poocommerce_single_product_summary', 'poocommerce_template_single_rating', 10 );
add_action( 'poocommerce_single_product_summary', 'poocommerce_template_single_price', 10 );
add_action( 'poocommerce_single_product_summary', 'poocommerce_template_single_excerpt', 20 );
add_action( 'poocommerce_single_product_summary', 'poocommerce_template_single_meta', 40 );
add_action( 'poocommerce_single_product_summary', 'poocommerce_template_single_sharing', 50 );

/**
 * Reviews
 *
 * @see poocommerce_review_display_gravatar()
 * @see poocommerce_review_display_rating()
 * @see poocommerce_review_display_meta()
 * @see poocommerce_review_display_comment_text()
 */
add_action( 'poocommerce_review_before', 'poocommerce_review_display_gravatar', 10 );
add_action( 'poocommerce_review_before_comment_meta', 'poocommerce_review_display_rating', 10 );
add_action( 'poocommerce_review_meta', 'poocommerce_review_display_meta', 10 );
add_action( 'poocommerce_review_comment_text', 'poocommerce_review_display_comment_text', 10 );

/**
 * Product Add to cart.
 *
 * @see poocommerce_template_single_add_to_cart()
 * @see poocommerce_simple_add_to_cart()
 * @see poocommerce_grouped_add_to_cart()
 * @see poocommerce_variable_add_to_cart()
 * @see poocommerce_external_add_to_cart()
 * @see poocommerce_single_variation()
 * @see poocommerce_single_variation_add_to_cart_button()
 */
add_action( 'poocommerce_single_product_summary', 'poocommerce_template_single_add_to_cart', 30 );
add_action( 'poocommerce_simple_add_to_cart', 'poocommerce_simple_add_to_cart', 30 );
add_action( 'poocommerce_grouped_add_to_cart', 'poocommerce_grouped_add_to_cart', 30 );
add_action( 'poocommerce_variable_add_to_cart', 'poocommerce_variable_add_to_cart', 30 );
add_action( 'poocommerce_external_add_to_cart', 'poocommerce_external_add_to_cart', 30 );
add_action( 'poocommerce_single_variation', 'poocommerce_single_variation', 10 );
add_action( 'poocommerce_single_variation', 'poocommerce_single_variation_add_to_cart_button', 20 );

/**
 * Pagination after shop loops.
 *
 * @see poocommerce_pagination()
 */
add_action( 'poocommerce_after_shop_loop', 'poocommerce_pagination', 10 );

/**
 * Product page tabs.
 */
add_filter( 'poocommerce_product_tabs', 'poocommerce_default_product_tabs' );
add_filter( 'poocommerce_product_tabs', 'poocommerce_sort_product_tabs', 99 );

/**
 * Additional Information tab.
 *
 * @see wc_display_product_attributes()
 */
add_action( 'poocommerce_product_additional_information', 'wc_display_product_attributes', 10 );

/**
 * Checkout.
 *
 * @see poocommerce_checkout_login_form()
 * @see poocommerce_checkout_coupon_form()
 * @see poocommerce_order_review()
 * @see poocommerce_checkout_payment()
 * @see wc_checkout_privacy_policy_text()
 * @see wc_terms_and_conditions_page_content()
 * @see wc_get_pay_buttons()
 */
add_action( 'poocommerce_before_checkout_form', 'poocommerce_checkout_login_form', 10 );
add_action( 'poocommerce_before_checkout_form', 'poocommerce_checkout_coupon_form', 10 );
add_action( 'poocommerce_checkout_order_review', 'poocommerce_order_review', 10 );
add_action( 'poocommerce_checkout_order_review', 'poocommerce_checkout_payment', 20 );
add_action( 'poocommerce_checkout_terms_and_conditions', 'wc_checkout_privacy_policy_text', 20 );
add_action( 'poocommerce_checkout_terms_and_conditions', 'wc_terms_and_conditions_page_content', 30 );
add_action( 'poocommerce_checkout_before_customer_details', 'wc_get_pay_buttons', 30 );

/**
 * Cart widget
 */
add_action( 'poocommerce_widget_shopping_cart_buttons', 'poocommerce_widget_shopping_cart_button_view_cart', 10 );
add_action( 'poocommerce_widget_shopping_cart_buttons', 'poocommerce_widget_shopping_cart_proceed_to_checkout', 20 );
add_action( 'poocommerce_widget_shopping_cart_total', 'poocommerce_widget_shopping_cart_subtotal', 10 );

/**
 * Cart.
 *
 * @see poocommerce_cross_sell_display()
 * @see poocommerce_cart_totals()
 * @see wc_get_pay_buttons()
 * @see poocommerce_button_proceed_to_checkout()
 * @see wc_empty_cart_message()
 */
add_action( 'poocommerce_cart_collaterals', 'poocommerce_cross_sell_display' );
add_action( 'poocommerce_cart_collaterals', 'poocommerce_cart_totals', 10 );
add_action( 'poocommerce_proceed_to_checkout', 'wc_get_pay_buttons', 10 );
add_action( 'poocommerce_proceed_to_checkout', 'poocommerce_button_proceed_to_checkout', 20 );
add_action( 'poocommerce_cart_is_empty', 'wc_empty_cart_message', 10 );

/**
 * Footer.
 *
 * @see  wc_print_js()
 * @see poocommerce_demo_store()
 */
add_action( 'wp_footer', 'wc_print_js', 25 );
add_action( 'wp_footer', 'poocommerce_demo_store' );

/**
 * Order details.
 *
 * @see poocommerce_order_details_table()
 * @see poocommerce_order_again_button()
 */
add_action( 'poocommerce_view_order', 'poocommerce_order_details_table', 10 );
add_action( 'poocommerce_thankyou', 'poocommerce_order_details_table', 10 );
add_action( 'poocommerce_order_details_after_order_table', 'poocommerce_order_again_button' );

/**
 * Order downloads.
 *
 * @see poocommerce_order_downloads_table()
 */
add_action( 'poocommerce_available_downloads', 'poocommerce_order_downloads_table', 10 );

/**
 * Auth.
 *
 * @see poocommerce_output_auth_header()
 * @see poocommerce_output_auth_footer()
 */
add_action( 'poocommerce_auth_page_header', 'poocommerce_output_auth_header', 10 );
add_action( 'poocommerce_auth_page_footer', 'poocommerce_output_auth_footer', 10 );

/**
 * Comments.
 *
 * Disable Jetpack comments.
 */
add_filter( 'jetpack_comment_form_enabled_for_product', '__return_false' );

/**
 * My Account.
 */
add_action( 'poocommerce_account_navigation', 'poocommerce_account_navigation' );
add_action( 'poocommerce_account_content', 'poocommerce_account_content' );
add_action( 'poocommerce_account_orders_endpoint', 'poocommerce_account_orders' );
add_action( 'poocommerce_account_view-order_endpoint', 'poocommerce_account_view_order' );
add_action( 'poocommerce_account_downloads_endpoint', 'poocommerce_account_downloads' );
add_action( 'poocommerce_account_edit-address_endpoint', 'poocommerce_account_edit_address' );
add_action( 'poocommerce_account_payment-methods_endpoint', 'poocommerce_account_payment_methods' );
add_action( 'poocommerce_account_add-payment-method_endpoint', 'poocommerce_account_add_payment_method' );
add_action( 'poocommerce_account_edit-account_endpoint', 'poocommerce_account_edit_account' );
add_action( 'poocommerce_register_form', 'wc_registration_privacy_policy_text', 20 );

/**
 * Notices.
 */
add_action( 'poocommerce_cart_is_empty', 'poocommerce_output_all_notices', 5 );
add_action( 'poocommerce_shortcode_before_product_cat_loop', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_before_shop_loop', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_before_single_product', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_before_cart', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_before_checkout_form_cart_notices', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_before_checkout_form', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_account_content', 'poocommerce_output_all_notices', 5 );
add_action( 'poocommerce_before_customer_login_form', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_before_lost_password_form', 'poocommerce_output_all_notices', 10 );
add_action( 'before_poocommerce_pay', 'poocommerce_output_all_notices', 10 );
add_action( 'poocommerce_before_reset_password_form', 'poocommerce_output_all_notices', 10 );

/**
 * Hooked blocks.
 */
add_action( 'after_switch_theme', 'wc_after_switch_theme', 10, 2 );
