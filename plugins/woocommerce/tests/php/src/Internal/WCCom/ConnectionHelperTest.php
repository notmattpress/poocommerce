<?php

namespace Automattic\PooCommerce\Tests\Internal\WCCom;

use Automattic\PooCommerce\Internal\WCCom\ConnectionHelper;

/**
 * Class ConnectionHelperTest.
 */
class ConnectionHelperTest extends \WC_Unit_Test_Case {

	/**
	 * Test is_connected method based on option value.
	 */
	public function test_is_connected() {
		delete_option( 'poocommerce_helper_data' );
		$this->assertEquals( false, ConnectionHelper::is_connected() );

		update_option( 'poocommerce_helper_data', array( 'auth' => 'random token' ) );
		$this->assertEquals( true, ConnectionHelper::is_connected() );
	}
}
