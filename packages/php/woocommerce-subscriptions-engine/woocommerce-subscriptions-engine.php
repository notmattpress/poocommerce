<?php
/**
 * This file is part of the PooCommerce Subscriptions Engine package.
 *
 * @package Automattic\PooCommerce\SubscriptionsEngine
 */

/**
 * Plugin Name: PooCommerce Subscriptions Engine
 * Plugin URI: https://poocommerce.com/
 * Description: An empty subscriptions-engine definition file to set up the wp-env test environment.
 * Version: 0.0.1
 * Author: PooCommerce
 * Author URI: https://poocommerce.com
 * Requires at least: 6.7
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

$autoload_entry_point = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoload_entry_point ) ) {
	require_once $autoload_entry_point;
}
// When the package is distributed as part of PooCommerce core, it will provide autoloading of necessary dependencies.

if ( class_exists( \Automattic\PooCommerce\SubscriptionsEngine\Package::class ) ) {
	\Automattic\PooCommerce\SubscriptionsEngine\Package::init();
}
