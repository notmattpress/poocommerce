<?php
/**
 * This array contains the names of the standalone functions that will become mockable via FunctionsMockerHack
 * when running unit tests. If you need to mock a function that isn't in the list, simply add it.
 * Please keep it sorted alphabetically.
 *
 * @package PooCommerce Tests
 */

return array(
	'current_user_can',
	'get_bloginfo',
	'get_poocommerce_currencies',
	'get_poocommerce_currency_symbol',
	'wc_get_price_excluding_tax',
	'wc_get_shipping_method_count',
	'wc_prices_include_tax',
	'wc_site_is_https',
);
