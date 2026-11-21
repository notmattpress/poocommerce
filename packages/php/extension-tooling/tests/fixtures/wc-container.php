<?php
/**
 * Install the PooCommerce container fixtures.
 *
 * @package PooCommerce\ExtensionTools
 */

/**
 * Return the active PooCommerce container.
 *
 * @return object
 */
function wc_get_container() {
	return $GLOBALS['wc_container'];
}

require __DIR__ . '/class-testbootstrapcontainer.php';
require __DIR__ . '/class-testbootstraptestingcontainer.php';

class_alias( TestBootstrapContainer::class, 'Automattic\PooCommerce\Container' );
class_alias( TestBootstrapTestingContainer::class, 'Automattic\PooCommerce\Testing\Tools\TestingContainer' );
