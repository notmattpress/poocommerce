<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Internal\ProductFeed\Utils;

use Automattic\PooCommerce\Internal\ProductFeed\Utils\StringHelper;

/**
 * StringHelper test class.
 */
class StringHelperTest extends \WC_Unit_Test_Case {
	/**
	 * Simple assertion.
	 */
	public function test_demo() {
		$this->assertTrue( true );
	}

	/**
	 * Test a static method to make sure the autoloader works.
	 */
	public function test_plugin_class() {
		$this->assertEquals( 'true', StringHelper::bool_string( 'yes' ) );
	}
}
