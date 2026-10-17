<?php
/**
 * Package loader.
 *
 * @package PooCommerce\Tests
 */

/**
 * WC_Tests_Packages class.
 */
class WC_Tests_Packages extends WC_Unit_Test_Case {

	/**
	 * Test packages exist - this requires composer install to have ran.
	 */
	public function test_packages_exist() {
		$this->assertTrue( \Automattic\PooCommerce\Packages::package_exists( 'poocommerce-admin' ) );
	}

	/**
	 * Test packages autoload correctly.
	 */
	public function test_autoload_packages() {
		$this->assertTrue( class_exists( '\Automattic\PooCommerce\Blocks\Package' ) );
		$this->assertTrue( class_exists( '\Automattic\PooCommerce\RestApi\Package' ) );
	}
}
