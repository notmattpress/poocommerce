<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer;

use Automattic\PooCommerce\EmailEditor\Integrations\Core\Renderer\Blocks\Text;

require_once __DIR__ . '/Dummy_Block_Renderer.php';

/**
 * Integration test for Blocks_Registry
 */
class Blocks_Registry_Test extends \Email_Editor_Integration_Test_Case {

	/**
	 * Instance of Blocks_Registry
	 *
	 * @var Blocks_Registry
	 */
	private $registry;

	/**
	 * Set up before each test.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->registry = $this->di_container->get( Blocks_Registry::class );
	}

	/**
	 * Test it returns null for unknown renderer.
	 */
	public function testItReturnsNullForUnknownRenderer(): void {
		$stored_renderer = $this->registry->get_block_renderer( 'test' );
		$this->assertNull( $stored_renderer );
	}

	/**
	 * Test it stores added renderer.
	 */
	public function testItStoresAddedRenderer(): void {
		$renderer = new Text();
		$this->registry->add_block_renderer( 'test', $renderer );
		$stored_renderer = $this->registry->get_block_renderer( 'test' );
		$this->assertSame( $renderer, $stored_renderer );
	}

	/**
	 * Test it reports which renderers are registered.
	 */
	public function testItReportsWhichRenderersAreRegistered(): void {
		$renderer = new Text();
		$this->registry->add_block_renderer( 'test', $renderer );
		$this->assertTrue( $this->registry->has_block_renderer( 'test' ) );
		$this->assertFalse( $this->registry->has_block_renderer( 'unknown' ) );
	}
}
