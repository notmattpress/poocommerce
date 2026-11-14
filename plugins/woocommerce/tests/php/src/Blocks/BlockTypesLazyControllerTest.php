<?php declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks;

use Automattic\PooCommerce\Blocks\Assets\Api;
use Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\PooCommerce\Blocks\BlockTypes\CartItemsBlock;
use Automattic\PooCommerce\Blocks\BlockTypes\CheckoutActionsBlock;
use Automattic\PooCommerce\Blocks\BlockTypes\EmptyMiniCartContentsBlock;
use Automattic\PooCommerce\Blocks\BlockTypesLazyController;
use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Tests\Blocks\Helpers\BlockTypeRegistryTrait;
use WC_Unit_Test_Case;

/**
 * Tests for the BlockTypesLazyController class.
 */
final class BlockTypesLazyControllerTest extends WC_Unit_Test_Case {
	use BlockTypeRegistryTrait;

	/**
	 * The blocks map for test-cases to operate on.
	 *
	 * @var array<string,string>
	 */
	private const TEST_BLOCKS = array(
		CartItemsBlock::class             => 'poocommerce/cart-items-block',
		CheckoutActionsBlock::class       => 'poocommerce/checkout-actions-block',
		EmptyMiniCartContentsBlock::class => 'poocommerce/empty-mini-cart-contents-block',
	);

	/**
	 * Controller instance.
	 *
	 * @var BlockTypesLazyController
	 */
	private $sut;

	/**
	 * Set up test fixtures.
	 */
	public function setUp(): void {
		parent::setUp();

		$this->sut = new BlockTypesLazyController(
			Package::container()->get( Api::class ),
			Package::container()->get( AssetDataRegistry::class )
		);

		$registry = \WP_Block_Type_Registry::get_instance();
		foreach ( self::TEST_BLOCKS as $name ) {
			$this->block_types_before_test[ $name ] = $registry->get_registered( $name );
			if ( $registry->is_registered( $name ) ) {
				$registry->unregister( $name );
			}
		}
	}

	/**
	 * @testdox Should register whitelisted blocks and detect WP registry removal.
	 */
	public function test_registers_whitelisted_blocks_and_excludes_unregistered_on_repeat(): void {
		$whitelist  = array_keys( self::TEST_BLOCKS );
		$registered = $this->sut->register_blocks( $whitelist );

		sort( $registered );
		$this->assertSame( $whitelist, $registered, 'All whitelisted block classes should be registered.' );

		$wp_registry = \WP_Block_Type_Registry::get_instance();
		foreach ( self::TEST_BLOCKS as $name ) {
			$this->assertTrue( $wp_registry->is_registered( $name ), "$name should be in WP block registry." );
		}

		$first_class = array_key_first( self::TEST_BLOCKS );
		$first_name  = self::TEST_BLOCKS[ $first_class ];

		$wp_registry->unregister( $first_name );
		$repeat = $this->sut->register_blocks( $whitelist );

		sort( $repeat );
		$this->assertSame( array_values( array_diff( $whitelist, array( $first_class ) ) ), $repeat, "$first_name should be excluded from repeat call after WP registry removal." );
	}
}
