<?php

namespace Automattic\PooCommerce\Tests\Blocks\Assets;

use Automattic\PooCommerce\Blocks\Assets\Api;
use Automattic\PooCommerce\Tests\Blocks\Mocks\AssetDataRegistryMock;
use Automattic\PooCommerce\Blocks\Package;
use InvalidArgumentException;

/**
 * Tests for the AssetDataRegistry class.
 *
 * @since $VID:$
 */
class AssetDataRegistry extends \WP_UnitTestCase {
	private $registry;

	protected function setUp(): void {
		$this->registry = new AssetDataRegistryMock(
			Package::container()->get( API::class )
		);
	}

	public function test_initial_data() {
		$this->assertEmpty( $this->registry->get() );
	}

	public function test_add_data() {
		$this->registry->add( 'test', 'foo' );
		$this->assertEquals( [ 'test' => 'foo' ], $this->registry->get() );
	}

	public function test_data_exists() {
		$this->registry->add( 'foo', 'lorem-ipsum' );
		$this->assertEquals( true, $this->registry->exists( 'foo' ) );
		$this->assertEquals( false, $this->registry->exists( 'bar' ) );
	}

	public function test_add_lazy_data() {
		$lazy = function () {
			return 'bar';
		};
		$this->registry->add( 'foo', $lazy );
		// should not be in data yet
		$this->assertEmpty( $this->registry->get() );
		$this->registry->execute_lazy_data();
		// should be in data now
		$this->assertEquals( [ 'foo' => 'bar' ], $this->registry->get() );
	}

	public function test_invalid_key_on_adding_data() {
		$this->setExpectedException( 'PHPUnit_Framework_Error_Warning' );
		$this->registry->add( [ 'some_value' ], 'foo' );
	}

	/**
	 * This tests the 'poocommerce_shared_settings' filter.
	 */
	public function test_poocommerce_filter_with_protected_data() {
		$this->registry->initialize_core_data();
		$original_data = $this->registry->get();
		add_filter( 'poocommerce_shared_settings', [ self::class, 'pdatcallback' ] );
		$data = $this->registry->get();
		$this->registry->initialize_core_data();
		$this->assertEquals( $original_data, $data );
		remove_filter( 'poocommerce_shared_settings', [ self::class, 'pdatcallback' ] );
	}

	public static function pdatcallback( $existing_data ) {
		$existing_data['locale']['siteLocale'] = 'cheeseburger';
		return $existing_data;
	}

	public static function ndcallback( $existing_data ) {
		$existing_data['cheeseburger'] = 'fries';
		return $existing_data;
	}

	public function test_poocommerce_filter_with_new_data() {
		$this->registry->initialize_core_data();
		$original_data = $this->registry->get();
		add_filter( 'poocommerce_shared_settings', [ self::class, 'ndcallback' ] );
		$this->registry->initialize_core_data();
		$data = $this->registry->get();
		$original_data['cheeseburger'] = 'fries';
		$this->assertEquals( $original_data, $data );
		remove_filter( 'poocommerce_shared_settings', [ self::class, 'ndcallback' ] );
	}
}
