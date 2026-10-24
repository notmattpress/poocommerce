<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\BlockTypes\OrderConfirmation;

use Automattic\PooCommerce\Blocks\Assets\Api;
use Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\PooCommerce\Blocks\BlockTypes\OrderConfirmation\AdditionalFieldsWrapper;
use Automattic\PooCommerce\Blocks\Integrations\IntegrationRegistry;
use Automattic\PooCommerce\Blocks\Package;
use WC_Unit_Test_Case;

/**
 * Tests for the additional fields wrapper block.
 */
class AdditionalFieldsWrapperTest extends WC_Unit_Test_Case {
	/**
	 * Remove the field registered by the test.
	 */
	public function tear_down() {
		__internal_poocommerce_blocks_deregister_checkout_field( 'test/order-confirmation-field' );
		parent::tear_down();
	}

	/**
	 * @testdox Order fields are published under the editor's setting key without removing the legacy key.
	 */
	public function test_order_fields_are_available_in_editor_settings(): void {
		$field_id = 'test/order-confirmation-field';
		poocommerce_register_additional_checkout_field(
			[
				'id'       => $field_id,
				'label'    => 'Order confirmation field',
				'location' => 'order',
			]
		);

		$registry = Package::container()->get( AssetDataRegistry::class );
		$block    = new class( Package::container()->get( Api::class ), $registry, new IntegrationRegistry() ) extends AdditionalFieldsWrapper {
			/**
			 * Skip registration; only data publishing is under test.
			 */
			protected function initialize() {}

			/**
			 * Publish the editor data.
			 */
			public function publish_data(): void {
				$this->enqueue_data();
			}
		};
		$block->publish_data();

		$get_method = new \ReflectionMethod( AssetDataRegistry::class, 'get' );
		if ( PHP_VERSION_ID < 80100 ) {
			$get_method->setAccessible( true );
		}
		$data = $get_method->invoke( $registry );
		$this->assertArrayHasKey( $field_id, $data['additionalOrderFields'], 'Order fields must reach the editor.' );
		$this->assertSame( $data['additionalFields'], $data['additionalOrderFields'], 'The existing setting must remain available.' );
	}
}
