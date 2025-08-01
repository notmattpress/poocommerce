<?php
/**
 * PooCommerce Core Functions
 *
 * General core functions available on both the front-end and admin.
 *
 * @package PooCommerce\Functions
 * @version 3.3.0
 */

use Automattic\Jetpack\Constants;
use Automattic\PooCommerce\Utilities\NumberUtil;
use Automattic\PooCommerce\Blocks\Utils\CartCheckoutUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include core functions (available in both admin and frontend).
require WC_ABSPATH . 'includes/wc-conditional-functions.php';
require WC_ABSPATH . 'includes/wc-coupon-functions.php';
require WC_ABSPATH . 'includes/wc-user-functions.php';
require WC_ABSPATH . 'includes/wc-deprecated-functions.php';
require WC_ABSPATH . 'includes/wc-formatting-functions.php';
require WC_ABSPATH . 'includes/wc-order-functions.php';
require WC_ABSPATH . 'includes/wc-order-item-functions.php';
require WC_ABSPATH . 'includes/wc-page-functions.php';
require WC_ABSPATH . 'includes/wc-product-functions.php';
require WC_ABSPATH . 'includes/wc-stock-functions.php';
require WC_ABSPATH . 'includes/wc-account-functions.php';
require WC_ABSPATH . 'includes/wc-term-functions.php';
require WC_ABSPATH . 'includes/wc-attribute-functions.php';
require WC_ABSPATH . 'includes/wc-rest-functions.php';
require WC_ABSPATH . 'includes/wc-widget-functions.php';
require WC_ABSPATH . 'includes/wc-webhook-functions.php';
require WC_ABSPATH . 'includes/wc-order-step-logger-functions.php';

/**
 * Filters on data used in admin and frontend.
 */
add_filter( 'poocommerce_coupon_code', 'wc_sanitize_coupon_code' );
add_filter( 'poocommerce_coupon_code', 'wc_strtolower' );
add_filter( 'poocommerce_stock_amount', 'intval' ); // Stock amounts are integers by default.
add_filter( 'poocommerce_shipping_rate_label', 'sanitize_text_field' ); // Shipping rate label.
add_filter( 'poocommerce_attribute_label', 'wp_kses_post', 100 );

/**
 * Short Description (excerpt).
 */
if ( function_exists( 'do_blocks' ) ) {
	add_filter( 'poocommerce_short_description', 'do_blocks', 9 );
}
add_filter( 'poocommerce_short_description', 'wptexturize' );
add_filter( 'poocommerce_short_description', 'convert_smilies' );
add_filter( 'poocommerce_short_description', 'convert_chars' );
add_filter( 'poocommerce_short_description', 'wpautop' );
add_filter( 'poocommerce_short_description', 'shortcode_unautop' );
add_filter( 'poocommerce_short_description', 'prepend_attachment' );
add_filter( 'poocommerce_short_description', 'do_shortcode', 11 ); // After wpautop().
add_filter( 'poocommerce_short_description', 'wc_format_product_short_description', 9999999 );
add_filter( 'poocommerce_short_description', 'wc_do_oembeds' );
add_filter( 'poocommerce_short_description', array( $GLOBALS['wp_embed'], 'run_shortcode' ), 8 ); // Before wpautop().

/**
 * Define a constant if it is not already defined.
 *
 * @since 3.0.0
 * @param string $name  Constant name.
 * @param mixed  $value Value.
 */
function wc_maybe_define_constant( $name, $value ) {
	if ( ! defined( $name ) ) {
		define( $name, $value );
	}
}

/**
 * Create a new order programmatically.
 *
 * Returns a new order object on success which can then be used to add additional data.
 *
 * @param  array $args Order arguments.
 * @return WC_Order|WP_Error
 */
function wc_create_order( $args = array() ) {
	$default_args = array(
		'status'        => null,
		'customer_id'   => null,
		'customer_note' => null,
		'parent'        => null,
		'created_via'   => null,
		'cart_hash'     => null,
		'order_id'      => 0,
	);

	try {
		$args  = wp_parse_args( $args, $default_args );
		$order = new WC_Order( $args['order_id'] );

		// Update props that were set (not null).
		if ( ! is_null( $args['parent'] ) ) {
			$order->set_parent_id( absint( $args['parent'] ) );
		}

		if ( ! is_null( $args['status'] ) ) {
			$order->set_status( $args['status'] );
		}

		if ( ! is_null( $args['customer_note'] ) ) {
			$order->set_customer_note( $args['customer_note'] );
		}

		if ( ! is_null( $args['customer_id'] ) ) {
			$order->set_customer_id( is_numeric( $args['customer_id'] ) ? absint( $args['customer_id'] ) : 0 );
		}

		if ( ! is_null( $args['created_via'] ) ) {
			$order->set_created_via( sanitize_text_field( $args['created_via'] ) );
		}

		if ( ! is_null( $args['cart_hash'] ) ) {
			$order->set_cart_hash( sanitize_text_field( $args['cart_hash'] ) );
		}

		// Set these fields when creating a new order but not when updating an existing order.
		if ( ! $args['order_id'] ) {
			$order->set_currency( get_poocommerce_currency() );
			$order->set_prices_include_tax( 'yes' === get_option( 'poocommerce_prices_include_tax' ) );
			$order->set_customer_ip_address( WC_Geolocation::get_ip_address() );
			$order->set_customer_user_agent( wc_get_user_agent() );
		}

		// Update other order props set automatically.
		$order->save();
	} catch ( Exception $e ) {
		return new WP_Error( 'error', $e->getMessage() );
	}

	return $order;
}

/**
 * Update an order. Uses wc_create_order.
 *
 * @param  array $args Order arguments.
 * @return WC_Order|WP_Error
 */
function wc_update_order( $args ) {
	if ( empty( $args['order_id'] ) ) {
		return new WP_Error( __( 'Invalid order ID.', 'poocommerce' ) );
	}
	return wc_create_order( $args );
}

/**
 * Given a path, this will convert any of the subpaths into their corresponding tokens.
 *
 * @since 4.3.0
 * @param string $path The absolute path to tokenize.
 * @param array  $path_tokens An array keyed with the token, containing paths that should be replaced.
 * @return string The tokenized path.
 */
function wc_tokenize_path( $path, $path_tokens ) {
	// Order most to least specific so that the token can encompass as much of the path as possible.
	uasort(
		$path_tokens,
		function ( $a, $b ) {
			$a = strlen( $a );
			$b = strlen( $b );

			if ( $a > $b ) {
				return -1;
			}

			if ( $b > $a ) {
				return 1;
			}

			return 0;
		}
	);

	foreach ( $path_tokens as $token => $token_path ) {
		if ( 0 !== strpos( $path, $token_path ) ) {
			continue;
		}

		$path = str_replace( $token_path, '{{' . $token . '}}', $path );
	}

	return $path;
}

/**
 * Given a tokenized path, this will expand the tokens to their full path.
 *
 * @since 4.3.0
 * @param string $path The absolute path to expand.
 * @param array  $path_tokens An array keyed with the token, containing paths that should be expanded.
 * @return string The absolute path.
 */
function wc_untokenize_path( $path, $path_tokens ) {
	foreach ( $path_tokens as $token => $token_path ) {
		$path = str_replace( '{{' . $token . '}}', $token_path, $path );
	}

	return $path;
}

/**
 * Fetches an array containing all of the configurable path constants to be used in tokenization.
 *
 * @return array The key is the define and the path is the constant.
 */
function wc_get_path_define_tokens() {
	$defines = array(
		'ABSPATH',
		'WP_CONTENT_DIR',
		'WP_PLUGIN_DIR',
		'WPMU_PLUGIN_DIR',
		'PLUGINDIR',
		'WP_THEME_DIR',
	);

	$path_tokens = array();
	foreach ( $defines as $define ) {
		if ( defined( $define ) ) {
			$path_tokens[ $define ] = constant( $define );
		}
	}

	return apply_filters( 'poocommerce_get_path_define_tokens', $path_tokens );
}

/**
 * Get template part (for templates like the shop-loop).
 *
 * WC_TEMPLATE_DEBUG_MODE will prevent overrides in themes from taking priority.
 *
 * @param mixed  $slug Template slug.
 * @param string $name Template name (default: '').
 */
function wc_get_template_part( $slug, $name = '' ) {
	$cache_key = sanitize_key( implode( '-', array( 'template-part', $slug, $name, Constants::get_constant( 'WC_VERSION' ) ) ) );
	$template  = (string) wp_cache_get( $cache_key, 'poocommerce' );

	if ( ! $template ) {
		if ( $name ) {
			$template = WC_TEMPLATE_DEBUG_MODE ? '' : locate_template(
				array(
					"{$slug}-{$name}.php",
					WC()->template_path() . "{$slug}-{$name}.php",
				)
			);

			if ( ! $template ) {
				$fallback = WC()->plugin_path() . "/templates/{$slug}-{$name}.php";
				$template = file_exists( $fallback ) ? $fallback : '';
			}
		}

		if ( ! $template ) {
			// If template file doesn't exist, look in yourtheme/slug.php and yourtheme/poocommerce/slug.php.
			$template = WC_TEMPLATE_DEBUG_MODE ? '' : locate_template(
				array(
					"{$slug}.php",
					WC()->template_path() . "{$slug}.php",
				)
			);
		}

		// Don't cache the absolute path so that it can be shared between web servers with different paths.
		$cache_path = wc_tokenize_path( $template, wc_get_path_define_tokens() );

		wc_set_template_cache( $cache_key, $cache_path );
	} else {
		// Make sure that the absolute path to the template is resolved.
		$template = wc_untokenize_path( $template, wc_get_path_define_tokens() );
	}

	// Allow 3rd party plugins to filter template file from their plugin.
	$template = apply_filters( 'wc_get_template_part', $template, $slug, $name );

	if ( $template ) {
		load_template( $template, false );
	}
}

/**
 * Get other templates (e.g. product attributes) passing attributes and including the file.
 *
 * @param string $template_name Template name.
 * @param array  $args          Arguments. (default: array).
 * @param string $template_path Template path. (default: '').
 * @param string $default_path  Default path. (default: '').
 */
function wc_get_template( $template_name, $args = array(), $template_path = '', $default_path = '' ) {
	$cache_key = sanitize_key( implode( '-', array( 'template', $template_name, $template_path, $default_path, Constants::get_constant( 'WC_VERSION' ) ) ) );
	$template  = (string) wp_cache_get( $cache_key, 'poocommerce' );

	if ( ! $template ) {
		$template = wc_locate_template( $template_name, $template_path, $default_path );

		// Don't cache the absolute path so that it can be shared between web servers with different paths.
		$cache_path = wc_tokenize_path( $template, wc_get_path_define_tokens() );

		wc_set_template_cache( $cache_key, $cache_path );
	} else {
		// Make sure that the absolute path to the template is resolved.
		$template = wc_untokenize_path( $template, wc_get_path_define_tokens() );
	}

	// Allow 3rd party plugin filter template file from their plugin.
	$filter_template = apply_filters( 'wc_get_template', $template, $template_name, $args, $template_path, $default_path );

	if ( $filter_template !== $template ) {
		if ( ! file_exists( $filter_template ) ) {
			/* translators: %s template */
			wc_doing_it_wrong( __FUNCTION__, sprintf( __( '%s does not exist.', 'poocommerce' ), '<code>' . $filter_template . '</code>' ), '2.1' );
			return;
		}
		$template = $filter_template;
	}

	$action_args = array(
		'template_name' => $template_name,
		'template_path' => $template_path,
		'located'       => $template,
		'args'          => $args,
	);

	if ( ! empty( $args ) && is_array( $args ) ) {
		if ( isset( $args['action_args'] ) ) {
			wc_doing_it_wrong(
				__FUNCTION__,
				__( 'action_args should not be overwritten when calling wc_get_template.', 'poocommerce' ),
				'3.6.0'
			);
			unset( $args['action_args'] );
		}
		extract( $args ); // @codingStandardsIgnoreLine
	}

	do_action( 'poocommerce_before_template_part', $action_args['template_name'], $action_args['template_path'], $action_args['located'], $action_args['args'] );

	include $action_args['located'];

	do_action( 'poocommerce_after_template_part', $action_args['template_name'], $action_args['template_path'], $action_args['located'], $action_args['args'] );
}

/**
 * Like wc_get_template, but returns the HTML instead of outputting.
 *
 * @see wc_get_template
 * @since 2.5.0
 * @param string $template_name Template name.
 * @param array  $args          Arguments. (default: array).
 * @param string $template_path Template path. (default: '').
 * @param string $default_path  Default path. (default: '').
 *
 * @return string
 */
function wc_get_template_html( $template_name, $args = array(), $template_path = '', $default_path = '' ) {
	ob_start();
	wc_get_template( $template_name, $args, $template_path, $default_path );
	return ob_get_clean();
}
/**
 * Locate a template and return the path for inclusion.
 *
 * This is the load order:
 *
 * yourtheme/$template_path/$template_name
 * yourtheme/$template_name
 * $default_path/$template_name
 *
 * @param string $template_name Template name.
 * @param string $template_path Template path. (default: '').
 * @param string $default_path  Default path. (default: '').
 * @return string
 */
function wc_locate_template( $template_name, $template_path = '', $default_path = '' ) {
	if ( ! $template_path ) {
		$template_path = WC()->template_path();
	}

	if ( ! $default_path ) {
		$default_path = WC()->plugin_path() . '/templates/';
	}

	// Look within passed path within the theme - this is priority.
	if ( false !== strpos( $template_name, 'product_cat' ) || false !== strpos( $template_name, 'product_tag' ) ) {
		$cs_template = str_replace( '_', '-', $template_name );
		$template    = locate_template(
			array(
				trailingslashit( $template_path ) . $cs_template,
				$cs_template,
			)
		);
	}

	if ( empty( $template ) ) {
		$template = locate_template(
			array(
				trailingslashit( $template_path ) . $template_name,
				$template_name,
			)
		);
	}

	// Get default template/.
	if ( ! $template || WC_TEMPLATE_DEBUG_MODE ) {
		if ( empty( $cs_template ) ) {
			$template = $default_path . $template_name;
		} else {
			$template = $default_path . $cs_template;
		}
	}

	/**
	 * Filter to customize the path of a given PooCommerce template.
	 *
	 * Note: the $default_path argument was added in PooCommerce 9.5.0.
	 *
	 * @param string $template Full file path of the template.
	 * @param string $template_name Template name.
	 * @param string $template_path Template path.
	 * @param string $template_path Default PooCommerce templates path.
	 *
	 * @since 9.5.0 $default_path argument added.
	 */
	return apply_filters( 'poocommerce_locate_template', $template, $template_name, $template_path, $default_path );
}

/**
 * Add a template to the template cache.
 *
 * @since 4.3.0
 * @param string $cache_key Object cache key.
 * @param string $template Located template.
 */
function wc_set_template_cache( $cache_key, $template ) {
	wp_cache_set( $cache_key, $template, 'poocommerce' );

	$cached_templates = wp_cache_get( 'cached_templates', 'poocommerce' );
	if ( is_array( $cached_templates ) ) {
		$cached_templates[] = $cache_key;
	} else {
		$cached_templates = array( $cache_key );
	}

	wp_cache_set( 'cached_templates', $cached_templates, 'poocommerce' );
}

/**
 * Clear the template cache.
 *
 * @since 4.3.0
 */
function wc_clear_template_cache() {
	$cached_templates = wp_cache_get( 'cached_templates', 'poocommerce' );
	if ( is_array( $cached_templates ) ) {
		foreach ( $cached_templates as $cache_key ) {
			wp_cache_delete( $cache_key, 'poocommerce' );
		}

		wp_cache_delete( 'cached_templates', 'poocommerce' );
	}
}

/**
 * Clear the system status theme info cache.
 *
 * @since 9.4.0
 */
function wc_clear_system_status_theme_info_cache() {
	delete_transient( 'wc_system_status_theme_info' );
}

/**
 * Get Base Currency Code.
 *
 * @return string
 */
function get_poocommerce_currency() {
	return apply_filters( 'poocommerce_currency', get_option( 'poocommerce_currency' ) );
}

/**
 * Get full list of currency codes.
 *
 * Currency symbols and names should follow the Unicode CLDR recommendation (https://cldr.unicode.org/translation/currency-names-and-symbols)
 *
 * @return array
 */
function get_poocommerce_currencies() {
	static $currencies;

	if ( ! isset( $currencies ) ) {
		$currencies = array_unique(
			apply_filters(
				'poocommerce_currencies',
				array(
					'AED' => __( 'United Arab Emirates dirham', 'poocommerce' ),
					'AFN' => __( 'Afghan afghani', 'poocommerce' ),
					'ALL' => __( 'Albanian lek', 'poocommerce' ),
					'AMD' => __( 'Armenian dram', 'poocommerce' ),
					'ANG' => __( 'Netherlands Antillean guilder', 'poocommerce' ),
					'AOA' => __( 'Angolan kwanza', 'poocommerce' ),
					'ARS' => __( 'Argentine peso', 'poocommerce' ),
					'AUD' => __( 'Australian dollar', 'poocommerce' ),
					'AWG' => __( 'Aruban florin', 'poocommerce' ),
					'AZN' => __( 'Azerbaijani manat', 'poocommerce' ),
					'BAM' => __( 'Bosnia and Herzegovina convertible mark', 'poocommerce' ),
					'BBD' => __( 'Barbadian dollar', 'poocommerce' ),
					'BDT' => __( 'Bangladeshi taka', 'poocommerce' ),
					'BGN' => __( 'Bulgarian lev', 'poocommerce' ),
					'BHD' => __( 'Bahraini dinar', 'poocommerce' ),
					'BIF' => __( 'Burundian franc', 'poocommerce' ),
					'BMD' => __( 'Bermudian dollar', 'poocommerce' ),
					'BND' => __( 'Brunei dollar', 'poocommerce' ),
					'BOB' => __( 'Bolivian boliviano', 'poocommerce' ),
					'BRL' => __( 'Brazilian real', 'poocommerce' ),
					'BSD' => __( 'Bahamian dollar', 'poocommerce' ),
					'BTC' => __( 'Bitcoin', 'poocommerce' ),
					'BTN' => __( 'Bhutanese ngultrum', 'poocommerce' ),
					'BWP' => __( 'Botswana pula', 'poocommerce' ),
					'BYR' => __( 'Belarusian ruble (old)', 'poocommerce' ),
					'BYN' => __( 'Belarusian ruble', 'poocommerce' ),
					'BZD' => __( 'Belize dollar', 'poocommerce' ),
					'CAD' => __( 'Canadian dollar', 'poocommerce' ),
					'CDF' => __( 'Congolese franc', 'poocommerce' ),
					'CHF' => __( 'Swiss franc', 'poocommerce' ),
					'CLP' => __( 'Chilean peso', 'poocommerce' ),
					'CNY' => __( 'Chinese yuan', 'poocommerce' ),
					'COP' => __( 'Colombian peso', 'poocommerce' ),
					'CRC' => __( 'Costa Rican col&oacute;n', 'poocommerce' ),
					'CUC' => __( 'Cuban convertible peso', 'poocommerce' ),
					'CUP' => __( 'Cuban peso', 'poocommerce' ),
					'CVE' => __( 'Cape Verdean escudo', 'poocommerce' ),
					'CZK' => __( 'Czech koruna', 'poocommerce' ),
					'DJF' => __( 'Djiboutian franc', 'poocommerce' ),
					'DKK' => __( 'Danish krone', 'poocommerce' ),
					'DOP' => __( 'Dominican peso', 'poocommerce' ),
					'DZD' => __( 'Algerian dinar', 'poocommerce' ),
					'EGP' => __( 'Egyptian pound', 'poocommerce' ),
					'ERN' => __( 'Eritrean nakfa', 'poocommerce' ),
					'ETB' => __( 'Ethiopian birr', 'poocommerce' ),
					'EUR' => __( 'Euro', 'poocommerce' ),
					'FJD' => __( 'Fijian dollar', 'poocommerce' ),
					'FKP' => __( 'Falkland Islands pound', 'poocommerce' ),
					'GBP' => __( 'Pound sterling', 'poocommerce' ),
					'GEL' => __( 'Georgian lari', 'poocommerce' ),
					'GGP' => __( 'Guernsey pound', 'poocommerce' ),
					'GHS' => __( 'Ghana cedi', 'poocommerce' ),
					'GIP' => __( 'Gibraltar pound', 'poocommerce' ),
					'GMD' => __( 'Gambian dalasi', 'poocommerce' ),
					'GNF' => __( 'Guinean franc', 'poocommerce' ),
					'GTQ' => __( 'Guatemalan quetzal', 'poocommerce' ),
					'GYD' => __( 'Guyanese dollar', 'poocommerce' ),
					'HKD' => __( 'Hong Kong dollar', 'poocommerce' ),
					'HNL' => __( 'Honduran lempira', 'poocommerce' ),
					'HRK' => __( 'Croatian kuna', 'poocommerce' ),
					'HTG' => __( 'Haitian gourde', 'poocommerce' ),
					'HUF' => __( 'Hungarian forint', 'poocommerce' ),
					'IDR' => __( 'Indonesian rupiah', 'poocommerce' ),
					'ILS' => __( 'Israeli new shekel', 'poocommerce' ),
					'IMP' => __( 'Manx pound', 'poocommerce' ),
					'INR' => __( 'Indian rupee', 'poocommerce' ),
					'IQD' => __( 'Iraqi dinar', 'poocommerce' ),
					'IRR' => __( 'Iranian rial', 'poocommerce' ),
					'IRT' => __( 'Iranian toman', 'poocommerce' ),
					'ISK' => __( 'Icelandic kr&oacute;na', 'poocommerce' ),
					'JEP' => __( 'Jersey pound', 'poocommerce' ),
					'JMD' => __( 'Jamaican dollar', 'poocommerce' ),
					'JOD' => __( 'Jordanian dinar', 'poocommerce' ),
					'JPY' => __( 'Japanese yen', 'poocommerce' ),
					'KES' => __( 'Kenyan shilling', 'poocommerce' ),
					'KGS' => __( 'Kyrgyzstani som', 'poocommerce' ),
					'KHR' => __( 'Cambodian riel', 'poocommerce' ),
					'KMF' => __( 'Comorian franc', 'poocommerce' ),
					'KPW' => __( 'North Korean won', 'poocommerce' ),
					'KRW' => __( 'South Korean won', 'poocommerce' ),
					'KWD' => __( 'Kuwaiti dinar', 'poocommerce' ),
					'KYD' => __( 'Cayman Islands dollar', 'poocommerce' ),
					'KZT' => __( 'Kazakhstani tenge', 'poocommerce' ),
					'LAK' => __( 'Lao kip', 'poocommerce' ),
					'LBP' => __( 'Lebanese pound', 'poocommerce' ),
					'LKR' => __( 'Sri Lankan rupee', 'poocommerce' ),
					'LRD' => __( 'Liberian dollar', 'poocommerce' ),
					'LSL' => __( 'Lesotho loti', 'poocommerce' ),
					'LYD' => __( 'Libyan dinar', 'poocommerce' ),
					'MAD' => __( 'Moroccan dirham', 'poocommerce' ),
					'MDL' => __( 'Moldovan leu', 'poocommerce' ),
					'MGA' => __( 'Malagasy ariary', 'poocommerce' ),
					'MKD' => __( 'Macedonian denar', 'poocommerce' ),
					'MMK' => __( 'Burmese kyat', 'poocommerce' ),
					'MNT' => __( 'Mongolian t&ouml;gr&ouml;g', 'poocommerce' ),
					'MOP' => __( 'Macanese pataca', 'poocommerce' ),
					'MRU' => __( 'Mauritanian ouguiya', 'poocommerce' ),
					'MUR' => __( 'Mauritian rupee', 'poocommerce' ),
					'MVR' => __( 'Maldivian rufiyaa', 'poocommerce' ),
					'MWK' => __( 'Malawian kwacha', 'poocommerce' ),
					'MXN' => __( 'Mexican peso', 'poocommerce' ),
					'MYR' => __( 'Malaysian ringgit', 'poocommerce' ),
					'MZN' => __( 'Mozambican metical', 'poocommerce' ),
					'NAD' => __( 'Namibian dollar', 'poocommerce' ),
					'NGN' => __( 'Nigerian naira', 'poocommerce' ),
					'NIO' => __( 'Nicaraguan c&oacute;rdoba', 'poocommerce' ),
					'NOK' => __( 'Norwegian krone', 'poocommerce' ),
					'NPR' => __( 'Nepalese rupee', 'poocommerce' ),
					'NZD' => __( 'New Zealand dollar', 'poocommerce' ),
					'OMR' => __( 'Omani rial', 'poocommerce' ),
					'PAB' => __( 'Panamanian balboa', 'poocommerce' ),
					'PEN' => __( 'Sol', 'poocommerce' ),
					'PGK' => __( 'Papua New Guinean kina', 'poocommerce' ),
					'PHP' => __( 'Philippine peso', 'poocommerce' ),
					'PKR' => __( 'Pakistani rupee', 'poocommerce' ),
					'PLN' => __( 'Polish z&#x142;oty', 'poocommerce' ),
					'PRB' => __( 'Transnistrian ruble', 'poocommerce' ),
					'PYG' => __( 'Paraguayan guaran&iacute;', 'poocommerce' ),
					'QAR' => __( 'Qatari riyal', 'poocommerce' ),
					'RON' => __( 'Romanian leu', 'poocommerce' ),
					'RSD' => __( 'Serbian dinar', 'poocommerce' ),
					'RUB' => __( 'Russian ruble', 'poocommerce' ),
					'RWF' => __( 'Rwandan franc', 'poocommerce' ),
					'SAR' => __( 'Saudi riyal', 'poocommerce' ),
					'SBD' => __( 'Solomon Islands dollar', 'poocommerce' ),
					'SCR' => __( 'Seychellois rupee', 'poocommerce' ),
					'SDG' => __( 'Sudanese pound', 'poocommerce' ),
					'SEK' => __( 'Swedish krona', 'poocommerce' ),
					'SGD' => __( 'Singapore dollar', 'poocommerce' ),
					'SHP' => __( 'Saint Helena pound', 'poocommerce' ),
					'SLL' => __( 'Sierra Leonean leone', 'poocommerce' ),
					'SOS' => __( 'Somali shilling', 'poocommerce' ),
					'SRD' => __( 'Surinamese dollar', 'poocommerce' ),
					'SSP' => __( 'South Sudanese pound', 'poocommerce' ),
					'STN' => __( 'S&atilde;o Tom&eacute; and Pr&iacute;ncipe dobra', 'poocommerce' ),
					'SYP' => __( 'Syrian pound', 'poocommerce' ),
					'SZL' => __( 'Swazi lilangeni', 'poocommerce' ),
					'THB' => __( 'Thai baht', 'poocommerce' ),
					'TJS' => __( 'Tajikistani somoni', 'poocommerce' ),
					'TMT' => __( 'Turkmenistan manat', 'poocommerce' ),
					'TND' => __( 'Tunisian dinar', 'poocommerce' ),
					'TOP' => __( 'Tongan pa&#x2bb;anga', 'poocommerce' ),
					'TRY' => __( 'Turkish lira', 'poocommerce' ),
					'TTD' => __( 'Trinidad and Tobago dollar', 'poocommerce' ),
					'TWD' => __( 'New Taiwan dollar', 'poocommerce' ),
					'TZS' => __( 'Tanzanian shilling', 'poocommerce' ),
					'UAH' => __( 'Ukrainian hryvnia', 'poocommerce' ),
					'UGX' => __( 'Ugandan shilling', 'poocommerce' ),
					'USD' => __( 'United States (US) dollar', 'poocommerce' ),
					'UYU' => __( 'Uruguayan peso', 'poocommerce' ),
					'UZS' => __( 'Uzbekistani som', 'poocommerce' ),
					'VEF' => __( 'Venezuelan bol&iacute;var (2008–2018)', 'poocommerce' ),
					'VES' => __( 'Venezuelan bol&iacute;var', 'poocommerce' ),
					'VND' => __( 'Vietnamese &#x111;&#x1ed3;ng', 'poocommerce' ),
					'VUV' => __( 'Vanuatu vatu', 'poocommerce' ),
					'WST' => __( 'Samoan t&#x101;l&#x101;', 'poocommerce' ),
					'XAF' => __( 'Central African CFA franc', 'poocommerce' ),
					'XCD' => __( 'East Caribbean dollar', 'poocommerce' ),
					'XOF' => __( 'West African CFA franc', 'poocommerce' ),
					'XPF' => __( 'CFP franc', 'poocommerce' ),
					'YER' => __( 'Yemeni rial', 'poocommerce' ),
					'ZAR' => __( 'South African rand', 'poocommerce' ),
					'ZMW' => __( 'Zambian kwacha', 'poocommerce' ),
				)
			)
		);
	}

	return $currencies;
}

/**
 * Get all available Currency symbols.
 *
 * Currency symbols and names should follow the Unicode CLDR recommendation (https://cldr.unicode.org/translation/currency-names-and-symbols)
 *
 * @since 4.1.0
 * @return array
 */
function get_poocommerce_currency_symbols() {

	$symbols = apply_filters(
		'poocommerce_currency_symbols',
		array(
			'AED' => '&#x62f;.&#x625;',
			'AFN' => '&#x60b;',
			'ALL' => 'L',
			'AMD' => 'AMD',
			'ANG' => '&fnof;',
			'AOA' => 'Kz',
			'ARS' => '&#36;',
			'AUD' => '&#36;',
			'AWG' => 'Afl.',
			'AZN' => '&#8380;',
			'BAM' => 'KM',
			'BBD' => '&#36;',
			'BDT' => '&#2547;&nbsp;',
			'BGN' => '&#1083;&#1074;.',
			'BHD' => '.&#x62f;.&#x628;',
			'BIF' => 'Fr',
			'BMD' => '&#36;',
			'BND' => '&#36;',
			'BOB' => 'Bs.',
			'BRL' => '&#82;&#36;',
			'BSD' => '&#36;',
			'BTC' => '&#3647;',
			'BTN' => 'Nu.',
			'BWP' => 'P',
			'BYR' => 'Br',
			'BYN' => 'Br',
			'BZD' => '&#36;',
			'CAD' => '&#36;',
			'CDF' => 'Fr',
			'CHF' => '&#67;&#72;&#70;',
			'CLP' => '&#36;',
			'CNY' => '&yen;',
			'COP' => '&#36;',
			'CRC' => '&#x20a1;',
			'CUC' => '&#36;',
			'CUP' => '&#36;',
			'CVE' => '&#36;',
			'CZK' => '&#75;&#269;',
			'DJF' => 'Fr',
			'DKK' => 'kr.',
			'DOP' => 'RD&#36;',
			'DZD' => '&#x62f;.&#x62c;',
			'EGP' => 'EGP',
			'ERN' => 'Nfk',
			'ETB' => 'Br',
			'EUR' => '&euro;',
			'FJD' => '&#36;',
			'FKP' => '&pound;',
			'GBP' => '&pound;',
			'GEL' => '&#x20be;',
			'GGP' => '&pound;',
			'GHS' => '&#x20b5;',
			'GIP' => '&pound;',
			'GMD' => 'D',
			'GNF' => 'Fr',
			'GTQ' => 'Q',
			'GYD' => '&#36;',
			'HKD' => '&#36;',
			'HNL' => 'L',
			'HRK' => 'kn',
			'HTG' => 'G',
			'HUF' => '&#70;&#116;',
			'IDR' => 'Rp',
			'ILS' => '&#8362;',
			'IMP' => '&pound;',
			'INR' => '&#8377;',
			'IQD' => '&#x62f;.&#x639;',
			'IRR' => '&#xfdfc;',
			'IRT' => '&#x062A;&#x0648;&#x0645;&#x0627;&#x0646;',
			'ISK' => 'kr.',
			'JEP' => '&pound;',
			'JMD' => '&#36;',
			'JOD' => '&#x62f;.&#x627;',
			'JPY' => '&yen;',
			'KES' => 'KSh',
			'KGS' => '&#x441;&#x43e;&#x43c;',
			'KHR' => '&#x17db;',
			'KMF' => 'Fr',
			'KPW' => '&#x20a9;',
			'KRW' => '&#8361;',
			'KWD' => '&#x62f;.&#x643;',
			'KYD' => '&#36;',
			'KZT' => '&#8376;',
			'LAK' => '&#8365;',
			'LBP' => '&#x644;.&#x644;',
			'LKR' => '&#xdbb;&#xdd4;',
			'LRD' => '&#36;',
			'LSL' => 'L',
			'LYD' => '&#x62f;.&#x644;',
			'MAD' => '&#x62f;.&#x645;.',
			'MDL' => 'MDL',
			'MGA' => 'Ar',
			'MKD' => '&#x434;&#x435;&#x43d;',
			'MMK' => 'Ks',
			'MNT' => '&#x20ae;',
			'MOP' => 'P',
			'MRU' => 'UM',
			'MUR' => '&#x20a8;',
			'MVR' => '.&#x783;',
			'MWK' => 'MK',
			'MXN' => '&#36;',
			'MYR' => '&#82;&#77;',
			'MZN' => 'MT',
			'NAD' => 'N&#36;',
			'NGN' => '&#8358;',
			'NIO' => 'C&#36;',
			'NOK' => '&#107;&#114;',
			'NPR' => '&#8360;',
			'NZD' => '&#36;',
			'OMR' => '&#x631;.&#x639;.',
			'PAB' => 'B/.',
			'PEN' => 'S/',
			'PGK' => 'K',
			'PHP' => '&#8369;',
			'PKR' => '&#8360;',
			'PLN' => '&#122;&#322;',
			'PRB' => '&#x440;.',
			'PYG' => '&#8370;',
			'QAR' => '&#x631;.&#x642;',
			'RMB' => '&yen;',
			'RON' => 'lei',
			'RSD' => '&#1088;&#1089;&#1076;',
			'RUB' => '&#8381;',
			'RWF' => 'Fr',
			'SAR' => '&#x631;.&#x633;',
			'SBD' => '&#36;',
			'SCR' => '&#x20a8;',
			'SDG' => '&#x62c;.&#x633;.',
			'SEK' => '&#107;&#114;',
			'SGD' => '&#36;',
			'SHP' => '&pound;',
			'SLL' => 'Le',
			'SOS' => 'Sh',
			'SRD' => '&#36;',
			'SSP' => '&pound;',
			'STN' => 'Db',
			'SYP' => '&#x644;.&#x633;',
			'SZL' => 'E',
			'THB' => '&#3647;',
			'TJS' => '&#x405;&#x41c;',
			'TMT' => 'm',
			'TND' => '&#x62f;.&#x62a;',
			'TOP' => 'T&#36;',
			'TRY' => '&#8378;',
			'TTD' => '&#36;',
			'TWD' => '&#78;&#84;&#36;',
			'TZS' => 'Sh',
			'UAH' => '&#8372;',
			'UGX' => 'UGX',
			'USD' => '&#36;',
			'UYU' => '&#36;',
			'UZS' => 'UZS',
			'VEF' => 'Bs F',
			'VES' => 'Bs.',
			'VND' => '&#8363;',
			'VUV' => 'Vt',
			'WST' => 'T',
			'XAF' => 'CFA',
			'XCD' => '&#36;',
			'XOF' => 'CFA',
			'XPF' => 'XPF',
			'YER' => '&#xfdfc;',
			'ZAR' => '&#82;',
			'ZMW' => 'ZK',
		)
	);

	return $symbols;
}

/**
 * Get Currency symbol.
 *
 * Currency symbols and names should follow the Unicode CLDR recommendation (https://cldr.unicode.org/translation/currency-names-and-symbols)
 *
 * @param string $currency Currency. (default: '').
 * @return string
 */
function get_poocommerce_currency_symbol( $currency = '' ) {
	if ( ! $currency ) {
		$currency = get_poocommerce_currency();
	}

	$symbols = get_poocommerce_currency_symbols();

	$currency_symbol = isset( $symbols[ $currency ] ) ? $symbols[ $currency ] : '';

	return apply_filters( 'poocommerce_currency_symbol', $currency_symbol, $currency );
}

/**
 * Send HTML emails from PooCommerce.
 *
 * @param mixed  $to          Receiver.
 * @param mixed  $subject     Subject.
 * @param mixed  $message     Message.
 * @param string $headers     Headers. (default: "Content-Type: text/html\r\n").
 * @param string $attachments Attachments. (default: "").
 * @return bool
 */
function wc_mail( $to, $subject, $message, $headers = "Content-Type: text/html\r\n", $attachments = '' ) {
	$mailer = WC()->mailer();

	return $mailer->send( $to, $subject, $message, $headers, $attachments );
}

/**
 * Return "theme support" values from the current theme, if set.
 *
 * @since  3.3.0
 * @param  string $prop Name of prop (or key::subkey for arrays of props) if you want a specific value. Leave blank to get all props as an array.
 * @param  mixed  $default Optional value to return if the theme does not declare support for a prop.
 * @return mixed  Value of prop(s).
 */
function wc_get_theme_support( $prop = '', $default = null ) {
	$theme_support = get_theme_support( 'poocommerce' );
	$theme_support = is_array( $theme_support ) ? $theme_support[0] : false;

	if ( ! $theme_support ) {
		return $default;
	}

	if ( $prop ) {
		$prop_stack = explode( '::', $prop );
		$prop_key   = array_shift( $prop_stack );

		if ( isset( $theme_support[ $prop_key ] ) ) {
			$value = $theme_support[ $prop_key ];

			if ( count( $prop_stack ) ) {
				foreach ( $prop_stack as $prop_key ) {
					if ( is_array( $value ) && isset( $value[ $prop_key ] ) ) {
						$value = $value[ $prop_key ];
					} else {
						$value = $default;
						break;
					}
				}
			}
		} else {
			$value = $default;
		}

		return $value;
	}

	return $theme_support;
}

/**
 * Get an image size by name or defined dimensions.
 *
 * The returned variable is filtered by poocommerce_get_image_size_{image_size} filter to
 * allow 3rd party customisation.
 *
 * Sizes defined by the theme take priority over settings. Settings are hidden when a theme
 * defines sizes.
 *
 * @param array|string $image_size Name of the image size to get, or an array of dimensions.
 * @return array Array of dimensions including width, height, and cropping mode. Cropping mode is 0 for no crop, and 1 for hard crop.
 */
function wc_get_image_size( $image_size ) {
	$cache_key = 'size-' . ( is_array( $image_size ) ? implode( '-', $image_size ) : $image_size );
	$size      = ! is_customize_preview() ? wp_cache_get( $cache_key, 'poocommerce' ) : false;

	if ( $size ) {
		return $size;
	}

	$size = array(
		'width'  => 600,
		'height' => 600,
		'crop'   => 1,
	);

	if ( is_array( $image_size ) ) {
		$size       = array(
			'width'  => isset( $image_size[0] ) ? absint( $image_size[0] ) : 600,
			'height' => isset( $image_size[1] ) ? absint( $image_size[1] ) : 600,
			'crop'   => isset( $image_size[2] ) ? absint( $image_size[2] ) : 1,
		);
		$image_size = $size['width'] . '_' . $size['height'];
	} else {
		$image_size = str_replace( 'poocommerce_', '', $image_size );

		if ( 'single' === $image_size ) {
			$size['width']  = absint( wc_get_theme_support( 'single_image_width', get_option( 'poocommerce_single_image_width', 600 ) ) );
			$size['height'] = '';
			$size['crop']   = 0;

		} elseif ( 'gallery_thumbnail' === $image_size ) {
			$size['width']  = absint( wc_get_theme_support( 'gallery_thumbnail_image_width', 100 ) );
			$size['height'] = $size['width'];
			$size['crop']   = 1;

		} elseif ( 'thumbnail' === $image_size ) {
			$size['width'] = absint( wc_get_theme_support( 'thumbnail_image_width', get_option( 'poocommerce_thumbnail_image_width', 300 ) ) );
			$cropping      = get_option( 'poocommerce_thumbnail_cropping', '1:1' );

			if ( 'uncropped' === $cropping ) {
				$size['height'] = '';
				$size['crop']   = 0;
			} elseif ( 'custom' === $cropping ) {
				$width          = max( 1, (float) get_option( 'poocommerce_thumbnail_cropping_custom_width', '4' ) );
				$height         = max( 1, (float) get_option( 'poocommerce_thumbnail_cropping_custom_height', '3' ) );
				$size['height'] = absint( NumberUtil::round( ( $size['width'] / $width ) * $height ) );
				$size['crop']   = 1;
			} else {
				$cropping_split = explode( ':', $cropping );
				$width          = max( 1, (float) current( $cropping_split ) );
				$height         = max( 1, (float) end( $cropping_split ) );
				$size['height'] = absint( NumberUtil::round( ( $size['width'] / $width ) * $height ) );
				$size['crop']   = 1;
			}
		}
	}

	$size = apply_filters( 'poocommerce_get_image_size_' . $image_size, $size );

	if ( is_customize_preview() ) {
		wp_cache_delete( $cache_key, 'poocommerce' );
	} else {
		wp_cache_set( $cache_key, $size, 'poocommerce' );
	}
	return $size;
}

/**
 * Queue some JavaScript code to be output in the footer.
 *
 * @param string $code Code.
 */
function wc_enqueue_js( $code ) {
	global $wc_queued_js;

	if ( empty( $wc_queued_js ) ) {
		$wc_queued_js = '';
	}

	$wc_queued_js .= "\n" . $code . "\n";
}

/**
 * Output any queued javascript code in the footer.
 */
function wc_print_js() {
	global $wc_queued_js;

	if ( ! empty( $wc_queued_js ) ) {
		// Sanitize.
		$wc_queued_js = wp_check_invalid_utf8( $wc_queued_js );
		$wc_queued_js = preg_replace( '/&#(x)?0*(?(1)27|39);?/i', "'", $wc_queued_js );
		$wc_queued_js = str_replace( "\r", '', $wc_queued_js );

		$js = "<!-- PooCommerce JavaScript -->\n<script type=\"text/javascript\">\njQuery(function($) { $wc_queued_js });\n</script>\n";

		/**
		 * Queued jsfilter.
		 *
		 * @since 2.6.0
		 * @param string $js JavaScript code.
		 */
		echo apply_filters( 'poocommerce_queued_js', $js ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		unset( $wc_queued_js );
	}
}

/**
 * Set a cookie - wrapper for setcookie using WP constants.
 *
 * @param  string  $name   Name of the cookie being set.
 * @param  string  $value  Value of the cookie.
 * @param  integer $expire Expiry of the cookie.
 * @param  bool    $secure Whether the cookie should be served only over https.
 * @param  bool    $httponly Whether the cookie is only accessible over HTTP, not scripting languages like JavaScript. @since 3.6.0.
 */
function wc_setcookie( $name, $value, $expire = 0, $secure = false, $httponly = false ) {
	/**
	 * Controls whether the cookie should be set via wc_setcookie().
	 *
	 * @since 6.3.0
	 *
	 * @param bool    $set_cookie_enabled If wc_setcookie() should set the cookie.
	 * @param string  $name               Cookie name.
	 * @param string  $value              Cookie value.
	 * @param integer $expire             When the cookie should expire.
	 * @param bool    $secure             If the cookie should only be served over HTTPS.
	 */
	if ( ! apply_filters( 'poocommerce_set_cookie_enabled', true, $name, $value, $expire, $secure ) ) {
		return;
	}

	if ( ! headers_sent() ) {
		/**
		 * Controls the options to be specified when setting the cookie.
		 *
		 * @see   https://www.php.net/manual/en/function.setcookie.php
		 * @since 6.7.0
		 *
		 * @param array  $cookie_options Cookie options.
		 * @param string $name           Cookie name.
		 * @param string $value          Cookie value.
		 */
		$options = apply_filters(
			'poocommerce_set_cookie_options',
			array(
				'expires'  => $expire,
				'secure'   => $secure,
				'path'     => COOKIEPATH ? COOKIEPATH : '/',
				'domain'   => COOKIE_DOMAIN,
				/**
				 * Controls whether the cookie should only be accessible via the HTTP protocol, or if it should also be
				 * accessible to Javascript.
				 *
				 * @see   https://www.php.net/manual/en/function.setcookie.php
				 * @since 3.3.0
				 *
				 * @param bool   $httponly If the cookie should only be accessible via the HTTP protocol.
				 * @param string $name     Cookie name.
				 * @param string $value    Cookie value.
				 * @param int    $expire   When the cookie should expire.
				 * @param bool   $secure   If the cookie should only be served over HTTPS.
				 */
				'httponly' => apply_filters( 'poocommerce_cookie_httponly', $httponly, $name, $value, $expire, $secure ),
			),
			$name,
			$value
		);

		setcookie( $name, $value, $options );
	} elseif ( Constants::is_true( 'WP_DEBUG' ) ) {
		headers_sent( $file, $line );
		trigger_error( "{$name} cookie cannot be set - headers already sent by {$file} on line {$line}", E_USER_NOTICE ); // @codingStandardsIgnoreLine
	}
}

/**
 * Recursively get page children.
 *
 * @param  int $page_id Page ID.
 * @return int[]
 */
function wc_get_page_children( $page_id ) {
	$page_ids = get_posts(
		array(
			'post_parent' => $page_id,
			'post_type'   => 'page',
			'numberposts' => -1, // @codingStandardsIgnoreLine
			'post_status' => 'any',
			'fields'      => 'ids',
		)
	);

	if ( ! empty( $page_ids ) ) {
		foreach ( $page_ids as $page_id ) {
			$page_ids = array_merge( $page_ids, wc_get_page_children( $page_id ) );
		}
	}

	return $page_ids;
}

/**
 * Flushes rewrite rules when the shop page (or it's children) gets saved.
 */
function flush_rewrite_rules_on_shop_page_save() {
	$screen    = get_current_screen();
	$screen_id = $screen ? $screen->id : '';

	// Check if this is the edit page.
	if ( 'page' !== $screen_id ) {
		return;
	}

	// Check if page is edited.
	if ( empty( $_GET['post'] ) || empty( $_GET['action'] ) || ( isset( $_GET['action'] ) && 'edit' !== $_GET['action'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return;
	}

	$post_id      = intval( $_GET['post'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$shop_page_id = wc_get_page_id( 'shop' );

	if ( $shop_page_id === $post_id || in_array( $post_id, wc_get_page_children( $shop_page_id ), true ) ) {
		do_action( 'poocommerce_flush_rewrite_rules' );
	}
}
add_action( 'admin_footer', 'flush_rewrite_rules_on_shop_page_save' );

/**
 * Various rewrite rule fixes.
 *
 * @since 2.2
 * @param array $rules Rules.
 * @return array
 */
function wc_fix_rewrite_rules( $rules ) {
	global $wp_rewrite;

	$permalinks = wc_get_permalink_structure();

	// Fix the rewrite rules when the product permalink have %product_cat% flag.
	if ( preg_match( '`/(.+)(/%product_cat%)`', $permalinks['product_rewrite_slug'], $matches ) ) {
		foreach ( $rules as $rule => $rewrite ) {
			if ( preg_match( '`^' . preg_quote( $matches[1], '`' ) . '/\(`', $rule ) && preg_match( '/^(index\.php\?product_cat)(?!(.*product))/', $rewrite ) ) {
				unset( $rules[ $rule ] );
			}
		}
	}

	// If the shop page is used as the base, we need to handle shop page subpages to avoid 404s.
	if ( ! $permalinks['use_verbose_page_rules'] ) {
		return $rules;
	}

	$shop_page_id = wc_get_page_id( 'shop' );
	if ( $shop_page_id ) {
		$page_rewrite_rules = array();
		$subpages           = wc_get_page_children( $shop_page_id );

		// Subpage rules.
		foreach ( $subpages as $subpage ) {
			$uri                                = get_page_uri( $subpage );
			$page_rewrite_rules[ $uri . '/?$' ] = 'index.php?pagename=' . $uri;
			$wp_generated_rewrite_rules         = $wp_rewrite->generate_rewrite_rules( $uri, EP_PAGES, true, true, false, false );
			foreach ( $wp_generated_rewrite_rules as $key => $value ) {
				$wp_generated_rewrite_rules[ $key ] = $value . '&pagename=' . $uri;
			}
			$page_rewrite_rules = array_merge( $page_rewrite_rules, $wp_generated_rewrite_rules );
		}

		// Merge with rules.
		$rules = array_merge( $page_rewrite_rules, $rules );
	}

	return $rules;
}
add_filter( 'rewrite_rules_array', 'wc_fix_rewrite_rules' );

/**
 * Prevent product attachment links from breaking when using complex rewrite structures.
 *
 * @param  string $link    Link.
 * @param  int    $post_id Post ID.
 * @return string
 */
function wc_fix_product_attachment_link( $link, $post_id ) {
	$parent_type = get_post_type( wp_get_post_parent_id( $post_id ) );
	if ( 'product' === $parent_type || 'product_variation' === $parent_type ) {
		$link = home_url( '/?attachment_id=' . $post_id );
	}
	return $link;
}
add_filter( 'attachment_link', 'wc_fix_product_attachment_link', 10, 2 );

/**
 * Protect downloads from ms-files.php in multisite.
 *
 * @param string $rewrite rewrite rules.
 * @return string
 */
function wc_ms_protect_download_rewite_rules( $rewrite ) {
	if ( ! is_multisite() || 'redirect' === get_option( 'poocommerce_file_download_method' ) ) {
		return $rewrite;
	}

	$rule  = "\n# PooCommerce Rules - Protect Files from ms-files.php\n\n";
	$rule .= "<IfModule mod_rewrite.c>\n";
	$rule .= "RewriteEngine On\n";
	$rule .= "RewriteCond %{QUERY_STRING} file=poocommerce_uploads/ [NC]\n";
	$rule .= "RewriteRule /ms-files.php$ - [F]\n";
	$rule .= "</IfModule>\n\n";

	return $rule . $rewrite;
}
add_filter( 'mod_rewrite_rules', 'wc_ms_protect_download_rewite_rules' );

/**
 * Formats a string in the format COUNTRY:STATE into an array.
 *
 * @since 2.3.0
 * @param  string $country_string Country string.
 * @return array
 */
function wc_format_country_state_string( $country_string ) {
	if ( strstr( $country_string, ':' ) ) {
		list( $country, $state ) = explode( ':', $country_string );
	} else {
		$country = $country_string;
		$state   = '';
	}
	return array(
		'country' => $country,
		'state'   => $state,
	);
}

/**
 * Get the store's base location.
 *
 * @since 2.3.0
 * @return array
 */
function wc_get_base_location() {
	$default = apply_filters( 'poocommerce_get_base_location', get_option( 'poocommerce_default_country', 'US:CA' ) );

	return wc_format_country_state_string( $default );
}

/**
 * Uses geolocation to get the customer country and state only if they are valid values.
 *
 * @since 9.5.0
 * @param array $fallback Fallback location.
 * @return array
 */
function wc_get_customer_geolocation( $fallback = array(
	'country' => '',
	'state'   => '',
) ) {
	$ua = wc_get_user_agent();

	// Exclude common bots from geolocation by user agent.
	if ( stripos( $ua, 'bot' ) !== false || stripos( $ua, 'spider' ) !== false || stripos( $ua, 'crawl' ) !== false ) {
		return $fallback;
	}

	$geolocation = WC_Geolocation::geolocate_ip( '', true, false );

	if ( empty( $geolocation['country'] ) ) {
		return $fallback;
	}

	// Ensure geolocation is valid.
	$allowed_countries = WC()->countries->get_allowed_countries();

	if ( ! isset( $allowed_countries[ $geolocation['country'] ] ) ) {
		return $fallback;
	}

	$allowed_states = WC()->countries->get_allowed_country_states();
	$country_states = $allowed_states[ $geolocation['country'] ] ?? array();

	if ( $country_states && ! isset( $country_states[ $geolocation['state'] ] ) ) {
		$geolocation['state'] = '';
	}

	return array(
		'country' => $geolocation['country'],
		'state'   => $geolocation['state'],
	);
}

/**
 * Get the customer's default location.
 *
 * Filtered, and set to base location or left blank. If cache-busting,
 * this should only be used when 'location' is set in the querystring.
 *
 * @since 2.3.0
 * @return array
 */
function wc_get_customer_default_location() {
	$set_default_location_to = get_option( 'poocommerce_default_customer_address', 'base' );

	// Unless the location should be blank, use the base location as the default.
	if ( '' !== $set_default_location_to ) {
		$default_location_string = get_option( 'poocommerce_default_country', 'US:CA' );
	}

	$default_location = wc_format_country_state_string(
		/**
		 * Filter the customer default location before geolocation.
		 *
		 * @since 2.3.0
		 * @param string $default_location_string The default location.
		 * @return string
		 */
		apply_filters( 'poocommerce_customer_default_location', $default_location_string ?? '' )
	);

	// Ensure defaults are valid.
	$allowed_countries = WC()->countries->get_allowed_countries();

	if ( ! in_array( $default_location['country'], array_keys( $allowed_countries ), true ) ) {
		$default_location = array(
			'country' => '',
			'state'   => '',
		);
	}

	// Geolocation takes priority if geolocation is possible.
	if ( in_array( $set_default_location_to, array( 'geolocation', 'geolocation_ajax' ), true ) ) {
		$default_location = wc_get_customer_geolocation( $default_location );
	}

	/**
	 * Filter the customer default location after geolocation.
	 *
	 * @since 2.3.0
	 * @param array $customer_location The customer location with keys 'country' and 'state'.
	 * @return array
	 */
	return apply_filters( 'poocommerce_customer_default_location_array', $default_location );
}

/**
 * Get user agent string.
 *
 * @since  3.0.0
 * @return string
 */
function wc_get_user_agent() {
	return isset( $_SERVER['HTTP_USER_AGENT'] ) ? wc_clean( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : ''; // @codingStandardsIgnoreLine
}

/**
 * Generate a rand hash.
 *
 * @since  2.4.0
 * @param  string $prefix Prefix for the hash.
 * @param  ?int   $max_length Maximum length of the hash. Excludes the prefix.
 * @return string
 */
function wc_rand_hash( $prefix = '', $max_length = null ) {
	try {
		$random = bin2hex( random_bytes( 20 ) );
	} catch ( Exception $e ) {
		if ( function_exists( 'wp_fast_hash' ) ) {
			$random = bin2hex( substr( wp_fast_hash( wp_rand() ), -20 ) );
		} else {
			$random = bin2hex( substr( sha1( wp_rand() ), -20 ) );
		}
	}

	if ( $max_length && $max_length > 0 ) {
		$random = substr( $random, 0, $max_length );
	}

	return $prefix . $random;
}

/**
 * WC API - Hash.
 *
 * @since  2.4.0
 * @param  string $data Message to be hashed.
 * @return string
 */
function wc_api_hash( $data ) {
	return hash_hmac( 'sha256', $data, 'wc-api' );
}

/**
 * Find all possible combinations of values from the input array and return in a logical order.
 *
 * @since 2.5.0
 * @param array $input Input.
 * @return array
 */
function wc_array_cartesian( $input ) {
	$input   = array_filter( $input );
	$results = array();
	$indexes = array();
	$index   = 0;

	// Generate indexes from keys and values so we have a logical sort order.
	foreach ( $input as $key => $values ) {
		foreach ( $values as $value ) {
			$indexes[ $key ][ $value ] = $index++;
		}
	}

	// Loop over the 2D array of indexes and generate all combinations.
	foreach ( $indexes as $key => $values ) {
		// When result is empty, fill with the values of the first looped array.
		if ( empty( $results ) ) {
			foreach ( $values as $value ) {
				$results[] = array( $key => $value );
			}
		} else {
			// Second and subsequent input sub-array merging.
			foreach ( $results as $result_key => $result ) {
				foreach ( $values as $value ) {
					// If the key is not set, we can set it.
					if ( ! isset( $results[ $result_key ][ $key ] ) ) {
						$results[ $result_key ][ $key ] = $value;
					} else {
						// If the key is set, we can add a new combination to the results array.
						$new_combination         = $results[ $result_key ];
						$new_combination[ $key ] = $value;
						$results[]               = $new_combination;
					}
				}
			}
		}
	}

	// Sort the indexes.
	arsort( $results );

	// Convert indexes back to values.
	foreach ( $results as $result_key => $result ) {
		$converted_values = array();

		// Sort the values.
		arsort( $results[ $result_key ] );

		// Convert the values.
		foreach ( $results[ $result_key ] as $key => $value ) {
			$converted_values[ $key ] = array_search( $value, $indexes[ $key ], true );
		}

		$results[ $result_key ] = $converted_values;
	}

	return $results;
}

/**
 * Run a MySQL transaction query, if supported.
 *
 * @since 2.5.0
 * @param string $type Types: start (default), commit, rollback.
 * @param bool   $force use of transactions.
 */
function wc_transaction_query( $type = 'start', $force = false ) {
	global $wpdb;

	$wpdb->hide_errors();

	wc_maybe_define_constant( 'WC_USE_TRANSACTIONS', true );

	if ( Constants::is_true( 'WC_USE_TRANSACTIONS' ) || $force ) {
		switch ( $type ) {
			case 'commit':
				$wpdb->query( 'COMMIT' );
				break;
			case 'rollback':
				$wpdb->query( 'ROLLBACK' );
				break;
			default:
				$wpdb->query( 'START TRANSACTION' );
				break;
		}
	}
}

/**
 * Gets the url to the cart page.
 *
 * @since 2.5.0
 * @since 9.3.0 To support shortcodes on other pages besides the main cart page, this returns the current URL if it is the cart page.
 *
 * @return string Url to cart page
 */
function wc_get_cart_url() {
	global $post;

	// We don't use is_cart() here because that also checks for a defined constant. We are only interested in the page.
	if ( CartCheckoutUtils::is_cart_page() ) {
		$cart_url = get_permalink( $post->ID );
	} else {
		$cart_url = wc_get_page_permalink( 'cart' );
	}

	/**
	 * Filter the cart URL.
	 *
	 * @since 2.5.0
	 * @param string $cart_url Cart URL.
	 */
	return apply_filters( 'poocommerce_get_cart_url', $cart_url );
}

/**
 * Gets the url to the checkout page.
 *
 * @since  2.5.0
 *
 * @return string Url to checkout page
 */
function wc_get_checkout_url() {
	$checkout_url = wc_get_page_permalink( 'checkout' );
	if ( $checkout_url ) {
		// Force SSL if needed.
		if ( is_ssl() || 'yes' === get_option( 'poocommerce_force_ssl_checkout' ) ) {
			$checkout_url = str_replace( 'http:', 'https:', $checkout_url );
		}
	}

	return apply_filters( 'poocommerce_get_checkout_url', $checkout_url );
}

/**
 * Register a shipping method.
 *
 * @since 1.5.7
 * @param string|object $shipping_method class name (string) or a class object.
 */
function poocommerce_register_shipping_method( $shipping_method ) {
	WC()->shipping()->register_shipping_method( $shipping_method );
}

if ( ! function_exists( 'wc_get_shipping_zone' ) ) {
	/**
	 * Get the shipping zone matching a given package from the cart.
	 *
	 * @since  2.6.0
	 * @uses   WC_Shipping_Zones::get_zone_matching_package
	 * @param  array $package Shipping package.
	 * @return WC_Shipping_Zone
	 */
	function wc_get_shipping_zone( $package ) {
		return WC_Shipping_Zones::get_zone_matching_package( $package );
	}
}

/**
 * Get a nice name for credit card providers.
 *
 * @since  2.6.0
 * @param  string $type Provider Slug/Type.
 * @return string
 */
function wc_get_credit_card_type_label( $type ) {
	// Normalize.
	$type = strtolower( $type );
	$type = str_replace( '-', ' ', $type );
	$type = str_replace( '_', ' ', $type );

	$labels = apply_filters(
		'poocommerce_credit_card_type_labels',
		array(
			'mastercard'       => _x( 'MasterCard', 'Name of credit card', 'poocommerce' ),
			'visa'             => _x( 'Visa', 'Name of credit card', 'poocommerce' ),
			'discover'         => _x( 'Discover', 'Name of credit card', 'poocommerce' ),
			'american express' => _x( 'American Express', 'Name of credit card', 'poocommerce' ),
			'cartes bancaires' => _x( 'Cartes Bancaires', 'Name of credit card', 'poocommerce' ),
			'diners'           => _x( 'Diners', 'Name of credit card', 'poocommerce' ),
			'jcb'              => _x( 'JCB', 'Name of credit card', 'poocommerce' ),
		)
	);

	/**
	 * Fallback to title case, uppercasing the first letter of each word.
	 *
	 * @since 8.9.0
	 */
	return apply_filters( 'poocommerce_get_credit_card_type_label', ( array_key_exists( $type, $labels ) ? $labels[ $type ] : ucwords( $type ) ) );
}

/**
 * Outputs a "back" link so admin screens can easily jump back a page.
 *
 * @param string $label Title of the page to return to.
 * @param string $url   URL of the page to return to.
 */
function wc_back_link( $label, $url ) {
	echo '<small class="wc-admin-breadcrumb"><a href="' . esc_url( $url ) . '" aria-label="' . esc_attr( $label ) . '">&#x2934;&#xfe0e;</a></small>';
}

/**
 * Outputs a header with "back" link so admin screens can easily jump back a page.
 *
 * @param string $title Title of the current page.
 * @param string $label Label of the page to return to.
 * @param string $url   URL of the page to return to.
 */
function wc_back_header( $title, $label, $url ) {
	echo '<h2 class="wc-admin-header">';
	echo '<small><a href="' . esc_url( $url ) . '" aria-label="' . esc_attr( $label ) . '"><span class="dashicons dashicons-arrow-left-alt2"></span></a></small>';
	echo esc_html( $title );
	echo '</h2>';
}

/**
 * Display a PooCommerce help tip.
 *
 * @since  2.5.0
 *
 * @param  string $tip        Help tip text.
 * @param  bool   $allow_html Allow sanitized HTML if true or escape.
 * @return string
 */
function wc_help_tip( $tip, $allow_html = false ) {
	if ( $allow_html ) {
		$sanitized_tip = wc_sanitize_tooltip( $tip );
	} else {
		$sanitized_tip = esc_attr( $tip );
	}

	$aria_label = wp_strip_all_tags( $tip );

	/**
	 * Filter the help tip.
	 *
	 * @since 7.7.0
	 *
	 * @param string $tip_html       Help tip HTML.
	 * @param string $sanitized_tip  Sanitized help tip text.
	 * @param string $tip            Original help tip text.
	 * @param bool   $allow_html     Allow sanitized HTML if true or escape.
	 *
	 * @return string
	 */
	return apply_filters( 'wc_help_tip', '<span class="poocommerce-help-tip" tabindex="0" aria-label="' . esc_attr( $aria_label ) . '" data-tip="' . $sanitized_tip . '"></span>', $sanitized_tip, $tip, $allow_html );
}

/**
 * Return a list of potential postcodes for wildcard searching.
 *
 * @since 2.6.0
 * @param  string $postcode Postcode.
 * @param  string $country  Country to format postcode for matching.
 * @return string[]
 */
function wc_get_wildcard_postcodes( $postcode, $country = '' ) {
	$formatted_postcode = wc_format_postcode( $postcode, $country );
	$length             = function_exists( 'mb_strlen' ) ? mb_strlen( $formatted_postcode ) : strlen( $formatted_postcode );
	$postcodes          = array(
		$postcode,
		$formatted_postcode,
		$formatted_postcode . '*',
	);

	for ( $i = 0; $i < $length; $i++ ) {
		$postcodes[] = ( function_exists( 'mb_substr' ) ? mb_substr( $formatted_postcode, 0, ( $i + 1 ) * -1 ) : substr( $formatted_postcode, 0, ( $i + 1 ) * -1 ) ) . '*';
	}

	return $postcodes;
}

/**
 * Used by shipping zones and taxes to compare a given $postcode to stored
 * postcodes to find matches for numerical ranges, and wildcards.
 *
 * @since 2.6.0
 * @param string $postcode           Postcode you want to match against stored postcodes.
 * @param array  $objects            Array of postcode objects from Database.
 * @param string $object_id_key      DB column name for the ID.
 * @param string $object_compare_key DB column name for the value.
 * @param string $country            Country from which this postcode belongs. Allows for formatting.
 * @return array Array of matching object ID and matching values.
 */
function wc_postcode_location_matcher( $postcode, $objects, $object_id_key, $object_compare_key, $country = '' ) {
	$postcode           = wc_normalize_postcode( $postcode );
	$wildcard_postcodes = array_map( 'wc_clean', wc_get_wildcard_postcodes( $postcode, $country ) );
	$matches            = array();

	foreach ( $objects as $object ) {
		$object_id       = $object->$object_id_key;
		$compare_against = $object->$object_compare_key;

		// Handle postcodes containing ranges.
		if ( strstr( $compare_against, '...' ) ) {
			$range = array_map( 'trim', explode( '...', $compare_against ) );

			if ( 2 !== count( $range ) ) {
				continue;
			}

			list( $min, $max ) = $range;

			// If the postcode is non-numeric, make it numeric.
			if ( ! is_numeric( $min ) || ! is_numeric( $max ) ) {
				$compare = wc_make_numeric_postcode( $postcode );
				$min     = str_pad( wc_make_numeric_postcode( $min ), strlen( $compare ), '0' );
				$max     = str_pad( wc_make_numeric_postcode( $max ), strlen( $compare ), '0' );
			} else {
				$compare = $postcode;
			}

			if ( $compare >= $min && $compare <= $max ) {
				$matches[ $object_id ]   = isset( $matches[ $object_id ] ) ? $matches[ $object_id ] : array();
				$matches[ $object_id ][] = $compare_against;
			}
		} elseif ( in_array( $compare_against, $wildcard_postcodes, true ) ) {
			// Wildcard and standard comparison.
			$matches[ $object_id ]   = isset( $matches[ $object_id ] ) ? $matches[ $object_id ] : array();
			$matches[ $object_id ][] = $compare_against;
		}
	}

	return $matches;
}

/**
 * Gets number of shipping methods currently enabled. Used to identify if
 * shipping is configured.
 *
 * @since  2.6.0
 * @param  bool $include_legacy Count legacy shipping methods too.
 * @param  bool $enabled_only   Whether non-legacy shipping methods should be
 *                              restricted to enabled ones. It doesn't affect
 *                              legacy shipping methods. @since 4.3.0.
 * @return int
 */
function wc_get_shipping_method_count( $include_legacy = false, $enabled_only = false ) {
	global $wpdb;

	$transient_name    = 'wc_shipping_method_count';
	$transient_version = WC_Cache_Helper::get_transient_version( 'shipping' );
	$transient_value   = get_transient( $transient_name );
	$counts            = array(
		'legacy'   => 0,
		'enabled'  => 0,
		'disabled' => 0,
	);

	if ( ! isset( $transient_value['legacy'], $transient_value['enabled'], $transient_value['disabled'], $transient_value['version'] ) || $transient_value['version'] !== $transient_version ) {
		// Count activated methods that don't support shipping zones if $include_legacy is true.
		$methods    = WC()->shipping()->get_shipping_methods();
		$method_ids = array();

		foreach ( $methods as $method ) {
			$method_ids[] = $method->id;

			if ( isset( $method->enabled ) && 'yes' === $method->enabled && ! $method->supports( 'shipping-zones' ) ) {
				++$counts['legacy'];
			}
		}

		// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared
		$counts['enabled']  = absint( $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}poocommerce_shipping_zone_methods WHERE is_enabled=1 AND method_id IN ('" . implode( "','", array_map( 'esc_sql', $method_ids ) ) . "')" ) );
		$counts['disabled'] = absint( $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}poocommerce_shipping_zone_methods WHERE is_enabled=0 AND method_id IN ('" . implode( "','", array_map( 'esc_sql', $method_ids ) ) . "')" ) );
		// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared

		$transient_value = array(
			'version'  => $transient_version,
			'legacy'   => $counts['legacy'],
			'enabled'  => $counts['enabled'],
			'disabled' => $counts['disabled'],
		);

		set_transient( $transient_name, $transient_value, DAY_IN_SECONDS * 30 );
	} else {
		$counts = $transient_value;
	}

	$return = 0;

	if ( $enabled_only ) {
		$return = $counts['enabled'];
	} else {
		$return = $counts['enabled'] + $counts['disabled'];
	}

	if ( $include_legacy ) {
		$return += $counts['legacy'];
	}

	return $return;
}

/**
 * Wrapper for set_time_limit to see if it is enabled.
 *
 * @since 2.6.0
 * @param int $limit Time limit.
 */
function wc_set_time_limit( $limit = 0 ) {
	if ( function_exists( 'set_time_limit' ) && false === strpos( ini_get( 'disable_functions' ), 'set_time_limit' ) && ! ini_get( 'safe_mode' ) ) { // phpcs:ignore PHPCompatibility.IniDirectives.RemovedIniDirectives.safe_modeDeprecatedRemoved
		@set_time_limit( $limit ); // @codingStandardsIgnoreLine
	}
}

/**
 * Wrapper for nocache_headers which also disables page caching.
 *
 * @since 3.2.4
 */
function wc_nocache_headers() {
	WC_Cache_Helper::set_nocache_constants();
	nocache_headers();
}

/**
 * Used to sort products attributes with uasort.
 *
 * @since 2.6.0
 * @param array $a First attribute to compare.
 * @param array $b Second attribute to compare.
 * @return int
 */
function wc_product_attribute_uasort_comparison( $a, $b ) {
	$a_position = is_null( $a ) ? null : $a['position'];
	$b_position = is_null( $b ) ? null : $b['position'];
	return wc_uasort_comparison( $a_position, $b_position );
}

/**
 * Used to sort shipping zone methods with uasort.
 *
 * @since 3.0.0
 * @param array $a First shipping zone method to compare.
 * @param array $b Second shipping zone method to compare.
 * @return int
 */
function wc_shipping_zone_method_order_uasort_comparison( $a, $b ) {
	return wc_uasort_comparison( $a->method_order, $b->method_order );
}

/**
 * User to sort checkout fields based on priority with uasort.
 *
 * @since 3.5.1
 * @param array $a First field to compare.
 * @param array $b Second field to compare.
 * @return int
 */
function wc_checkout_fields_uasort_comparison( $a, $b ) {
	/*
	 * We are not guaranteed to get a priority
	 * setting. So don't compare if they don't
	 * exist.
	 */
	if ( ! isset( $a['priority'], $b['priority'] ) ) {
		return 0;
	}

	return wc_uasort_comparison( $a['priority'], $b['priority'] );
}

/**
 * User to sort two values with ausort.
 *
 * @since 3.5.1
 * @param int $a First value to compare.
 * @param int $b Second value to compare.
 * @return int
 */
function wc_uasort_comparison( $a, $b ) {
	if ( $a === $b ) {
		return 0;
	}
	return ( $a < $b ) ? -1 : 1;
}

/**
 * Sort values based on ascii, useful for special chars in strings.
 *
 * @param string $a First value.
 * @param string $b Second value.
 * @return int
 */
function wc_ascii_uasort_comparison( $a, $b ) {
	$a = remove_accents( $a );
	$b = remove_accents( $b );
	return strcmp( $a, $b );
}

/**
 * Sort array according to current locale rules and maintaining index association.
 * By default tries to use Collator from PHP Internationalization Functions if available.
 * If PHP Collator class doesn't exists it fallback to removing accepts from a array
 * and by sorting with `uasort( $data, 'strcmp' )` giving support for ASCII values.
 *
 * @since 4.6.0
 * @param array  $data   List of values to sort.
 * @param string $locale Locale.
 * @return array
 */
function wc_asort_by_locale( &$data, $locale = '' ) {
	// Use Collator if PHP Internationalization Functions (php-intl) is available.
	if ( class_exists( 'Collator' ) ) {
		try {
			$locale   = $locale ? $locale : get_locale();
			$collator = new Collator( $locale );
			$collator->asort( $data, Collator::SORT_STRING );
			return $data;
		} catch ( IntlException $e ) {
			/*
			 * Just skip if some error got caused.
			 * It may be caused in installations that doesn't include ICU TZData.
			 */
			if ( Constants::is_true( 'WP_DEBUG' ) ) {
				error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					sprintf(
						'An unexpected error occurred while trying to use PHP Intl Collator class, it may be caused by an incorrect installation of PHP Intl and ICU, and could be fixed by reinstallaing PHP Intl, see more details about PHP Intl installation: %1$s. Error message: %2$s',
						'https://www.php.net/manual/en/intl.installation.php',
						$e->getMessage()
					)
				);
			}
		}
	}

	$raw_data = $data;

	array_walk(
		$data,
		function ( &$value ) {
			$value = remove_accents( html_entity_decode( $value ) );
		}
	);

	uasort( $data, 'strcmp' );

	foreach ( $data as $key => $val ) {
		$data[ $key ] = $raw_data[ $key ];
	}

	return $data;
}

/**
 * Get rounding mode for internal tax calculations.
 *
 * @since 3.2.4
 * @return int
 */
function wc_get_tax_rounding_mode() {
	$constant = WC_TAX_ROUNDING_MODE;

	if ( 'auto' === $constant ) {
		return 'yes' === get_option( 'poocommerce_prices_include_tax', 'no' ) ? PHP_ROUND_HALF_DOWN : PHP_ROUND_HALF_UP;
	}

	return intval( $constant );
}

/**
 * Get rounding precision for internal WC calculations.
 * Will return the value of wc_get_price_decimals increased by 2 decimals, with WC_ROUNDING_PRECISION being the minimum.
 *
 * @since 2.6.3
 * @return int
 */
function wc_get_rounding_precision() {
	$precision = wc_get_price_decimals() + 2;
	if ( $precision < absint( WC_ROUNDING_PRECISION ) ) {
		$precision = absint( WC_ROUNDING_PRECISION );
	}

	/**
	 * Filter the rounding precision for internal WC calculations. This is different from the number of decimals used for display.
	 * Generally, this filter can be used to decrease the precision, but if you choose to decrease, there maybe side effects such as off by one rounding errors for certain tax rate combinations.
	 *
	 * @since 8.8.0
	 *
	 * @param int $precision The number of decimals to round to.
	 */
	return apply_filters( 'poocommerce_internal_rounding_precision', $precision );
}

/**
 * Add precision to a number by moving the decimal point to the right as many places as indicated by wc_get_price_decimals().
 * Optionally the result is rounded so that the total number of digits equals wc_get_rounding_precision() plus one.
 *
 * @since  3.2.0
 * @param  float|null $value Number to add precision to.
 * @param  bool       $round If the result should be rounded.
 * @return int|float
 */
function wc_add_number_precision( ?float $value, bool $round = true ) {
	if ( ! $value ) {
		return 0.0;
	}

	// Fallback to standard rounding precision in order to cover rounding changes in PHP 8.4.
	$result          = $value * pow( 10, wc_get_price_decimals() );
	$round_precision = $round ? wc_get_rounding_precision() - wc_get_price_decimals() : wc_get_rounding_precision();

	return NumberUtil::round( $result, $round_precision );
}

/**
 * Remove precision from a number and return a float.
 *
 * @since  3.2.0
 * @param  float $value Number to add precision to.
 * @return float
 */
function wc_remove_number_precision( $value ) {
	if ( ! $value ) {
		return 0.0;
	}

	$cent_precision = pow( 10, wc_get_price_decimals() );
	return $value / $cent_precision;
}

/**
 * Add precision to an array of number and return an array of int.
 *
 * @since  3.2.0
 * @param  array $value Number to add precision to.
 * @param  bool  $round Should we round after adding precision?.
 * @return int|array
 */
function wc_add_number_precision_deep( $value, $round = true ) {
	if ( ! is_array( $value ) ) {
		return wc_add_number_precision( (float) $value, $round );
	}

	foreach ( $value as $key => $sub_value ) {
		$value[ $key ] = wc_add_number_precision_deep( $sub_value, $round );
	}

	return $value;
}

/**
 * Remove precision from an array of number and return an array of int.
 *
 * @since  3.2.0
 * @param  array $value Number to add precision to.
 * @return int|array
 */
function wc_remove_number_precision_deep( $value ) {
	if ( ! is_array( $value ) ) {
		return wc_remove_number_precision( $value );
	}

	foreach ( $value as $key => $sub_value ) {
		$value[ $key ] = wc_remove_number_precision_deep( $sub_value );
	}

	return $value;
}

/**
 * Get a shared logger instance.
 *
 * Use the poocommerce_logging_class filter to change the logging class. You may provide one of the following:
 *     - a class name which will be instantiated as `new $class` with no arguments
 *     - an instance which will be used directly as the logger
 * In either case, the class or instance *must* implement WC_Logger_Interface.
 *
 * @return WC_Logger_Interface
 */
function wc_get_logger() {
	static $logger = null;

	$class = apply_filters( 'poocommerce_logging_class', 'WC_Logger' );

	if ( null !== $logger && is_string( $class ) && is_a( $logger, $class ) ) {
		return $logger;
	}

	$implements = class_implements( $class );

	if ( is_array( $implements ) && in_array( 'WC_Logger_Interface', $implements, true ) ) {
		$logger = is_object( $class ) ? $class : new $class();
	} else {
		wc_doing_it_wrong(
			__FUNCTION__,
			sprintf(
				/* translators: 1: class name 2: poocommerce_logging_class 3: WC_Logger_Interface */
				__( 'The class %1$s provided by %2$s filter must implement %3$s.', 'poocommerce' ),
				'<code>' . esc_html( is_object( $class ) ? get_class( $class ) : $class ) . '</code>',
				'<code>poocommerce_logging_class</code>',
				'<code>WC_Logger_Interface</code>'
			),
			'3.0'
		);

		$logger = is_a( $logger, 'WC_Logger' ) ? $logger : new WC_Logger();
	}

	return $logger;
}

/**
 * Trigger logging cleanup using the logging class.
 *
 * @since 3.4.0
 */
function wc_cleanup_logs() {
	$logger = wc_get_logger();

	if ( is_callable( array( $logger, 'clear_expired_logs' ) ) ) {
		$logger->clear_expired_logs();
	}
}
add_action( 'poocommerce_cleanup_logs', 'wc_cleanup_logs' );

/**
 * Prints human-readable information about a variable.
 *
 * Some server environments block some debugging functions. This function provides a safe way to
 * turn an expression into a printable, readable form without calling blocked functions.
 *
 * @since 3.0
 *
 * @param mixed $expression The expression to be printed.
 * @param bool  $return     Optional. Default false. Set to true to return the human-readable string.
 * @return string|bool False if expression could not be printed. True if the expression was printed.
 *     If $return is true, a string representation will be returned.
 */
function wc_print_r( $expression, $return = false ) {
	$alternatives = array(
		array(
			'func' => 'print_r',
			'args' => array( $expression, true ),
		),
		array(
			'func' => 'var_export',
			'args' => array( $expression, true ),
		),
		array(
			'func' => 'json_encode',
			'args' => array( $expression ),
		),
		array(
			'func' => 'serialize',
			'args' => array( $expression ),
		),
	);

	$alternatives = apply_filters( 'poocommerce_print_r_alternatives', $alternatives, $expression );

	foreach ( $alternatives as $alternative ) {
		if ( function_exists( $alternative['func'] ) ) {
			$res = $alternative['func']( ...$alternative['args'] );
			if ( $return ) {
				return $res; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}

			echo $res; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			return true;
		}
	}

	return false;
}

/**
 * Based on wp_list_pluck, this calls a method instead of returning a property.
 *
 * @since 3.0.0
 * @param array      $list              List of objects or arrays.
 * @param int|string $callback_or_field Callback method from the object to place instead of the entire object.
 * @param int|string $index_key         Optional. Field from the object to use as keys for the new array.
 *                                      Default null.
 * @return array Array of values.
 */
function wc_list_pluck( $list, $callback_or_field, $index_key = null ) {
	// Use wp_list_pluck if this isn't a callback.
	$first_el = current( $list );
	if ( ! is_object( $first_el ) || ! is_callable( array( $first_el, $callback_or_field ) ) ) {
		return wp_list_pluck( $list, $callback_or_field, $index_key );
	}
	if ( ! $index_key ) {
		/*
		 * This is simple. Could at some point wrap array_column()
		 * if we knew we had an array of arrays.
		 */
		foreach ( $list as $key => $value ) {
			$list[ $key ] = $value->{$callback_or_field}();
		}
		return $list;
	}

	/*
	 * When index_key is not set for a particular item, push the value
	 * to the end of the stack. This is how array_column() behaves.
	 */
	$newlist = array();
	foreach ( $list as $value ) {
		// Get index. @since 3.2.0 this supports a callback.
		if ( is_callable( array( $value, $index_key ) ) ) {
			$newlist[ $value->{$index_key}() ] = $value->{$callback_or_field}();
		} elseif ( isset( $value->$index_key ) ) {
			$newlist[ $value->$index_key ] = $value->{$callback_or_field}();
		} else {
			$newlist[] = $value->{$callback_or_field}();
		}
	}
	return $newlist;
}

/**
 * Get permalink settings for things like products and taxonomies.
 *
 * As of 3.3.0, the permalink settings are stored to the option instead of
 * being blank and inheritting from the locale. This speeds up page loading
 * times by negating the need to switch locales on each page load.
 *
 * This is more inline with WP core behavior which does not localize slugs.
 *
 * @since  3.0.0
 * @return array
 */
function wc_get_permalink_structure() {
	$saved_permalinks = (array) get_option( 'poocommerce_permalinks', array() );
	$permalinks       = wp_parse_args(
		array_filter( $saved_permalinks ),
		array(
			'product_base'           => _x( 'product', 'slug', 'poocommerce' ),
			'category_base'          => _x( 'product-category', 'slug', 'poocommerce' ),
			'tag_base'               => _x( 'product-tag', 'slug', 'poocommerce' ),
			'attribute_base'         => '',
			'use_verbose_page_rules' => false,
		)
	);

	if ( $saved_permalinks !== $permalinks ) {
		update_option( 'poocommerce_permalinks', $permalinks );
	}

	$permalinks['product_rewrite_slug']   = untrailingslashit( $permalinks['product_base'] );
	$permalinks['category_rewrite_slug']  = untrailingslashit( $permalinks['category_base'] );
	$permalinks['tag_rewrite_slug']       = untrailingslashit( $permalinks['tag_base'] );
	$permalinks['attribute_rewrite_slug'] = untrailingslashit( $permalinks['attribute_base'] );

	return $permalinks;
}

/**
 * Switch PooCommerce to site language.
 *
 * @since 3.1.0
 */
function wc_switch_to_site_locale() {
	global $wp_locale_switcher;

	if ( function_exists( 'switch_to_locale' ) && isset( $wp_locale_switcher ) ) {
		switch_to_locale( get_locale() );

		// Filter on plugin_locale so load_plugin_textdomain loads the correct locale.
		add_filter( 'plugin_locale', 'get_locale' );

		// Init WC locale.
		WC()->load_plugin_textdomain();
	}
}

/**
 * Switch PooCommerce language to original.
 *
 * @since 3.1.0
 */
function wc_restore_locale() {
	global $wp_locale_switcher;

	if ( function_exists( 'restore_previous_locale' ) && isset( $wp_locale_switcher ) ) {
		restore_previous_locale();

		// Remove filter.
		remove_filter( 'plugin_locale', 'get_locale' );

		// Init WC locale.
		WC()->load_plugin_textdomain();
	}
}

/**
 * Convert plaintext phone number to clickable phone number.
 *
 * Remove formatting and allow "+".
 * Example and specs: https://developer.mozilla.org/en/docs/Web/HTML/Element/a#Creating_a_phone_link
 *
 * @since 3.1.0
 *
 * @param string $phone Content to convert phone number.
 * @return string Content with converted phone number.
 */
function wc_make_phone_clickable( $phone ) {
	$number = trim( preg_replace( '/[^\d|\+]/', '', $phone ) );

	return $number ? '<a href="tel:' . esc_attr( $number ) . '">' . esc_html( $phone ) . '</a>' : '';
}

/**
 * Get an item of post data if set, otherwise return a default value.
 *
 * @since  3.0.9
 * @param  string $key     Meta key.
 * @param  string $default Default value.
 * @return mixed Value sanitized by wc_clean.
 */
function wc_get_post_data_by_key( $key, $default = '' ) {
	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput, WordPress.Security.NonceVerification.Missing
	return wc_clean( wp_unslash( wc_get_var( $_POST[ $key ], $default ) ) );
}

/**
 * Get data if set, otherwise return a default value or null. Prevents notices when data is not set.
 *
 * @since  3.2.0
 * @param  mixed  $var     Variable.
 * @param  string $default Default value.
 * @return mixed
 */
function wc_get_var( &$var, $default = null ) {
	return isset( $var ) ? $var : $default;
}

/**
 * Read in PooCommerce headers when reading plugin headers.
 *
 * @since 3.2.0
 * @param array $headers Headers.
 * @return array
 */
function wc_enable_wc_plugin_headers( $headers ) {
	if ( ! class_exists( 'WC_Plugin_Updates' ) ) {
		include_once __DIR__ . '/admin/plugin-updates/class-wc-plugin-updates.php';
	}

	// WC requires at least - allows developers to define which version of PooCommerce the plugin requires to run.
	$headers[] = WC_Plugin_Updates::VERSION_REQUIRED_HEADER;

	// WC tested up to - allows developers  to define which version of PooCommerce they have tested up to.
	$headers[] = WC_Plugin_Updates::VERSION_TESTED_HEADER;

	// Woo - This is used in PooCommerce extensions and is picked up by the helper.
	$headers[] = 'Woo';

	return $headers;
}
add_filter( 'extra_theme_headers', 'wc_enable_wc_plugin_headers' );
add_filter( 'extra_plugin_headers', 'wc_enable_wc_plugin_headers' );

/**
 * Prevent auto-updating the PooCommerce plugin on major releases if there are untested extensions active.
 *
 * @since 3.2.0
 * @param  bool   $should_update If should update.
 * @param  object $plugin        Plugin data.
 * @return bool
 */
function wc_prevent_dangerous_auto_updates( $should_update, $plugin ) {
	if ( ! isset( $plugin->plugin, $plugin->new_version ) ) {
		return $should_update;
	}

	if ( 'poocommerce/poocommerce.php' !== $plugin->plugin ) {
		return $should_update;
	}

	if ( ! class_exists( 'WC_Plugin_Updates' ) ) {
		include_once __DIR__ . '/admin/plugin-updates/class-wc-plugin-updates.php';
	}

	$new_version    = wc_clean( $plugin->new_version );
	$plugin_updates = new WC_Plugin_Updates();
	$version_type   = Constants::get_constant( 'WC_SSR_PLUGIN_UPDATE_RELEASE_VERSION_TYPE' );
	if ( ! is_string( $version_type ) ) {
		$version_type = 'none';
	}
	$untested_plugins = $plugin_updates->get_untested_plugins( $new_version, $version_type );
	if ( ! empty( $untested_plugins ) ) {
		return false;
	}

	return $should_update;
}
add_filter( 'auto_update_plugin', 'wc_prevent_dangerous_auto_updates', 99, 2 );

/**
 * Delete expired transients.
 *
 * Deletes all expired transients. The multi-table delete syntax is used.
 * to delete the transient record from table a, and the corresponding.
 * transient_timeout record from table b.
 *
 * Based on code inside core's upgrade_network() function.
 *
 * @since 3.2.0
 * @return int Number of transients that were cleared.
 */
function wc_delete_expired_transients() {
	global $wpdb;

	// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared
	$sql  = "DELETE a, b FROM $wpdb->options a, $wpdb->options b
		WHERE a.option_name LIKE %s
		AND a.option_name NOT LIKE %s
		AND b.option_name = CONCAT( '_transient_timeout_', SUBSTRING( a.option_name, 12 ) )
		AND b.option_value < %d";
	$rows = $wpdb->query( $wpdb->prepare( $sql, $wpdb->esc_like( '_transient_' ) . '%', $wpdb->esc_like( '_transient_timeout_' ) . '%', time() ) );

	$sql   = "DELETE a, b FROM $wpdb->options a, $wpdb->options b
		WHERE a.option_name LIKE %s
		AND a.option_name NOT LIKE %s
		AND b.option_name = CONCAT( '_site_transient_timeout_', SUBSTRING( a.option_name, 17 ) )
		AND b.option_value < %d";
	$rows2 = $wpdb->query( $wpdb->prepare( $sql, $wpdb->esc_like( '_site_transient_' ) . '%', $wpdb->esc_like( '_site_transient_timeout_' ) . '%', time() ) );
	// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared

	return absint( $rows + $rows2 );
}
add_action( 'poocommerce_installed', 'wc_delete_expired_transients' );

/**
 * Make a URL relative, if possible.
 *
 * @since 3.2.0
 * @param string $url URL to make relative.
 * @return string
 */
function wc_get_relative_url( $url ) {
	return wc_is_external_resource( $url ) ? $url : str_replace( array( 'http://', 'https://' ), '//', $url );
}

/**
 * See if a resource is remote.
 *
 * @since 3.2.0
 * @param string $url URL to check.
 * @return bool
 */
function wc_is_external_resource( $url ) {
	$wp_base = str_replace( array( 'http://', 'https://' ), '//', get_home_url( null, '/', 'http' ) );

	return strstr( $url, '://' ) && ! strstr( $url, $wp_base );
}

/**
 * See if theme/s is activate or not.
 *
 * @since 3.3.0
 * @param string|array $theme Theme name or array of theme names to check.
 * @return boolean
 */
function wc_is_active_theme( $theme ) {
	return is_array( $theme ) ? in_array( get_template(), $theme, true ) : get_template() === $theme;
}

/**
 * Is the site using a default WP theme?
 *
 * @return boolean
 */
function wc_is_wp_default_theme_active() {
	return wc_is_active_theme(
		array(
			'twentytwentythree',
			'twentytwentytwo',
			'twentytwentyone',
			'twentytwenty',
			'twentynineteen',
			'twentyseventeen',
			'twentysixteen',
			'twentyfifteen',
			'twentyfourteen',
			'twentythirteen',
			'twentyeleven',
			'twentytwelve',
			'twentyten',
		)
	);
}

/**
 * Cleans up session data - cron callback.
 *
 * @since 3.3.0
 */
function wc_cleanup_session_data() {
	$session_class = apply_filters( 'poocommerce_session_handler', 'WC_Session_Handler' );
	$session       = new $session_class();

	if ( is_callable( array( $session, 'cleanup_sessions' ) ) ) {
		$session->cleanup_sessions();
	}
}
add_action( 'poocommerce_cleanup_sessions', 'wc_cleanup_session_data' );

/**
 * Convert a decimal (e.g. 3.5) to a fraction (e.g. 7/2).
 * From: https://www.designedbyaturtle.co.uk/2015/converting-a-decimal-to-a-fraction-in-php/
 *
 * @param float $decimal the decimal number.
 * @return array|bool a 1/2 would be [1, 2] array (this can be imploded with '/' to form a string).
 */
function wc_decimal_to_fraction( $decimal ) {
	if ( 0 > $decimal || ! is_numeric( $decimal ) ) {
		// Negative digits need to be passed in as positive numbers and prefixed as negative once the response is imploded.
		return false;
	}

	if ( 0 === $decimal ) {
		return array( 0, 1 );
	}

	$tolerance   = 1.e-4;
	$numerator   = 1;
	$h2          = 0;
	$denominator = 0;
	$k2          = 1;
	$b           = 1 / $decimal;

	do {
		$b           = 1 / $b;
		$a           = floor( $b );
		$aux         = $numerator;
		$numerator   = $a * $numerator + $h2;
		$h2          = $aux;
		$aux         = $denominator;
		$denominator = $a * $denominator + $k2;
		$k2          = $aux;
		$b           = $b - $a;
	} while ( abs( $decimal - $numerator / $denominator ) > $decimal * $tolerance );

	return array( $numerator, $denominator );
}

/**
 * Round discount.
 *
 * @param  double $value Amount to round.
 * @param  int    $precision DP to round.
 * @return float
 */
function wc_round_discount( $value, $precision ) {
	return NumberUtil::round( $value, $precision, WC_DISCOUNT_ROUNDING_MODE ); // phpcs:ignore PHPCompatibility.FunctionUse.NewFunctionParameters.round_modeFound
}

/**
 * Return the html selected attribute if stringified $value is found in array of stringified $options
 * or if stringified $value is the same as scalar stringified $options.
 *
 * @param string|int       $value   Value to find within options.
 * @param string|int|array $options Options to go through when looking for value.
 * @return string
 */
function wc_selected( $value, $options ) {
	if ( is_array( $options ) ) {
		$options = array_map( 'strval', $options );
		return selected( in_array( (string) $value, $options, true ), true, false );
	}

	return selected( $value, $options, false );
}

/**
 * Retrieves the MySQL server version. Based on $wpdb.
 *
 * @since 3.4.1
 * @return array Version information.
 */
function wc_get_server_database_version() {
	global $wpdb;

	if ( empty( $wpdb->is_mysql ) || empty( $wpdb->use_mysqli ) ) {
		return array(
			'string' => '',
			'number' => '',
		);
	}

	$server_info = $wpdb->get_var( 'SELECT VERSION()' );

	return array(
		'string' => $server_info,
		'number' => preg_replace( '/([^\d.]+).*/', '', $server_info ),
	);
}

/**
 * Initialize and load the cart functionality.
 *
 * @since 3.6.4
 * @return void
 */
function wc_load_cart() {
	if ( ! did_action( 'before_poocommerce_init' ) || doing_action( 'before_poocommerce_init' ) ) {
		/* translators: 1: wc_load_cart 2: poocommerce_init */
		wc_doing_it_wrong( __FUNCTION__, sprintf( __( '%1$s should not be called before the %2$s action.', 'poocommerce' ), 'wc_load_cart', 'poocommerce_init' ), '3.7' );
		return;
	}

	// Ensure dependencies are loaded in all contexts.
	include_once WC_ABSPATH . 'includes/wc-cart-functions.php';
	include_once WC_ABSPATH . 'includes/wc-notice-functions.php';

	WC()->initialize_session();
	WC()->initialize_cart();
}

/**
 * Test whether the context of execution comes from async action scheduler.
 *
 * @since 4.0.0
 * @return bool
 */
function wc_is_running_from_async_action_scheduler() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	return isset( $_REQUEST['action'] ) && 'as_async_request_queue_runner' === $_REQUEST['action'];
}

/**
 * Polyfill for wp_cache_get_multiple for WP versions before 5.5.
 *
 * @param array  $keys   Array of keys to get from group.
 * @param string $group  Optional. Where the cache contents are grouped. Default empty.
 * @param bool   $force  Optional. Whether to force an update of the local cache from the persistent
 *                            cache. Default false.
 * @return array|bool Array of values.
 */
function wc_cache_get_multiple( $keys, $group = '', $force = false ) {
	if ( function_exists( 'wp_cache_get_multiple' ) ) {
		return wp_cache_get_multiple( $keys, $group, $force );
	}
	$values = array();
	foreach ( $keys as $key ) {
		$values[ $key ] = wp_cache_get( $key, $group, $force );
	}
	return $values;
}

/**
 * Delete multiple transients in a single operation.
 *
 * IMPORTANT: This is a private function (internal use ONLY).
 *
 * This function efficiently deletes multiple transients at once, using a direct
 * database query when possible for better performance.
 *
 * @internal
 *
 * @since 9.8.0
 * @param array $transients Array of transient names to delete (without the '_transient_' prefix).
 * @return bool True on success, false on failure.
 */
function _wc_delete_transients( $transients ) {
	global $wpdb;

	if ( empty( $transients ) || ! is_array( $transients ) ) {
		return false;
	}

	// If using external object cache, delete each transient individually.
	if ( wp_using_ext_object_cache() ) {
		foreach ( $transients as $transient ) {
			delete_transient( $transient );
		}
		return true;
	} else {
		// For database storage, create a list of transient option names.
		$transient_names = array();
		foreach ( $transients as $transient ) {
			$transient_names[] = '_transient_' . $transient;
			$transient_names[] = '_transient_timeout_' . $transient;
		}

		// Limit the number of items in a single query to avoid exceeding database query parameter limits.
		if ( count( $transients ) > 199 ) {
			// Process in smaller chunks to reduce memory usage.
			$chunks  = array_chunk( $transients, 100 );
			$success = true;

			foreach ( $chunks as $chunk ) {
				$result = _wc_delete_transients( $chunk );
				if ( ! $result ) {
					$success = false;
				}
				// Force garbage collection after each chunk to free memory.
				gc_collect_cycles();
			}

			return $success;
		}

		try {
			// Before deleting, get the list of options to clear from cache.
			// Since we already have the option names we could skip this step but this mirrors WP's delete_option functionality.
			// It also allows us to only delete the options we know exist.
			$options_to_clear = array();
			if ( ! wp_installing() ) {
				$options_to_clear = $wpdb->get_col(
					$wpdb->prepare(
						'SELECT option_name FROM ' . $wpdb->options . ' WHERE option_name IN ( ' . implode( ', ', array_fill( 0, count( $transient_names ), '%s' ) ) . ' )',
						$transient_names
					)
				);
			}

			if ( empty( $options_to_clear ) ) {
				// If there are no options to clear, return true immediately.
				return true;
			}

			// Use a single query for better performance.
			$wpdb->query(
				$wpdb->prepare(
					'DELETE FROM ' . $wpdb->options . ' WHERE option_name IN ( ' . implode( ', ', array_fill( 0, count( $options_to_clear ), '%s' ) ) . ' )',
					$options_to_clear
				)
			);

			// Lets clear our options data from the cache.
			// We can batch delete if available, introduced in WP 6.0.0.
			if ( ! wp_installing() ) {
				if ( function_exists( 'wp_cache_delete_multiple' ) ) {
					wp_cache_delete_multiple( $options_to_clear, 'options' );
				} else {
					foreach ( $options_to_clear as $option_name ) {
						wp_cache_delete( $option_name, 'options' );
					}
				}

				// Also update alloptions cache if needed.
				// This is required to prevent phantom transients from being returned.
				$alloptions         = wp_load_alloptions( true );
				$updated_alloptions = false;

				if ( is_array( $alloptions ) ) {
					foreach ( $options_to_clear as $option_name ) {
						if ( isset( $alloptions[ $option_name ] ) ) {
							unset( $alloptions[ $option_name ] );
							$updated_alloptions = true;
						}
					}

					if ( $updated_alloptions ) {
						wp_cache_set( 'alloptions', $alloptions, 'options' );
					}
				}
			}

			return true;
		} catch ( Exception $e ) {
			wc_get_logger()->error(
				sprintf( 'Exception when deleting transients: %s', $e->getMessage() ),
				array( 'source' => '_wc_delete_transients' )
			);
			return false;
		}
	}
}
