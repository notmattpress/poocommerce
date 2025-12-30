<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

/**
 * Plugin Name: Email Editor
 * Plugin URI: https://poocommerce.com/
 * Description: An empty email-editor definition file to setup wp-env test env.
 * Version: 0.0.1
 * Author: Automattic
 * Author URI: https://poocommerce.com
 * Requires at least: 6.7
 * Requires PHP: 7.4
 */

$autoload_entry_point = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoload_entry_point ) ) {
	require_once $autoload_entry_point;
}
// When the package is distributed as part of PooCommerce core, it will provide autoloading of necessary dependencies.
