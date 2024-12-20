<?php
/**
 * Deprecated notice: This class is deprecated as of version 4.5.0. PooCommerce API is now part of core and not packaged separately.
 *
 * Returns information about the package and handles init.
 *
 * @package PooCommerce\RestApi
 */

namespace Automattic\PooCommerce\RestApi;

defined( 'ABSPATH' ) || exit;

/**
 * Main package class.
 *
 * @deprecated Use \Automattic\PooCommerce\RestApi\Server directly.
 */
class Package {

	/**
	 * Version.
	 *
	 * @deprecated since 4.5.0. This tracks PooCommerce version now.
	 * @var string
	 */
	const VERSION = WC_VERSION;

	/**
	 * Init the package - load the REST API Server class.
	 *
	 * @deprecated since 4.5.0. Directly call Automattic\PooCommerce\RestApi\Server::instance()->init()
	 */
	public static function init() {
		wc_deprecated_function( 'Automattic\PooCommerce\RestApi\Server::instance()->init()', '4.5.0' );
		\Automattic\PooCommerce\RestApi\Server::instance()->init();
	}

	/**
	 * Return the version of the package.
	 *
	 * @deprecated since 4.5.0. This tracks PooCommerce version now.
	 * @return string
	 */
	public static function get_version() {
		wc_deprecated_function( 'WC()->version', '4.5.0' );
		return WC()->version;
	}

	/**
	 * Return the path to the package.
	 *
	 * @deprecated since 4.5.0. Directly call Automattic\PooCommerce\RestApi\Server::get_path()
	 * @return string
	 */
	public static function get_path() {
		wc_deprecated_function( 'Automattic\PooCommerce\RestApi\Server::get_path()', '4.5.0' );
		return \Automattic\PooCommerce\RestApi\Server::get_path();
	}
}
