<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Layout;

use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Dummy_Block_Renderer;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Rendering_Context;
use Automattic\PooCommerce\EmailEditor\Engine\Theme_Controller;

require_once __DIR__ . '/../Dummy_Block_Renderer.php';

/**
 * Integration test for Flex_Layout_Renderer
 */
class Flex_Layout_Renderer_Test extends \Email_Editor_Integration_Test_Case {

	/**
	 * Instance of the renderer.
	 *
	 * @var Flex_Layout_Renderer
	 */
	private $renderer;

	/**
	 * Instance of the rendering context.
	 *
	 * @var Rendering_Context
	 */
	private $rendering_context;

	/**
	 * Set up before each test.
	 */
	public function setUp(): void {
		parent::setUp();
		$theme_controller        = $this->di_container->get( Theme_Controller::class );
		$this->rendering_context = new Rendering_Context( $theme_controller->get_theme() );
		$this->renderer          = new Flex_Layout_Renderer();
		register_block_type( 'dummy/block', array() );
		add_filter( 'render_block', array( $this, 'renderDummyBlock' ), 10, 2 );
	}

	/**
	 * Test it renders inner blocks.
	 */
	public function testItRendersInnerBlocks(): void {
		$parsed_block = array(
			'innerBlocks' => array(
				array(
					'blockName' => 'dummy/block',
					'innerHTML' => 'Dummy 1',
				),
				array(
					'blockName' => 'dummy/block',
					'innerHTML' => 'Dummy 2',
				),
			),
			'email_attrs' => array(),
		);
		$output       = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$this->assertStringContainsString( 'Dummy 1', $output );
		$this->assertStringContainsString( 'Dummy 2', $output );
	}

	/**
	 * Test it handles justifying the content.
	 */
	public function testItHandlesJustification(): void {
		$parsed_block = array(
			'innerBlocks' => array(
				array(
					'blockName' => 'dummy/block',
					'innerHTML' => 'Dummy 1',
				),
			),
			'email_attrs' => array(),
		);
		// Default justification is left.
		$output = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$this->assertStringContainsString( 'text-align: left', $output );
		$this->assertStringContainsString( 'align="left"', $output );
		// Right justification.
		$parsed_block['attrs']['layout']['justifyContent'] = 'right';
		$output = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$this->assertStringContainsString( 'text-align: right', $output );
		$this->assertStringContainsString( 'align="right"', $output );
		// Center justification.
		$parsed_block['attrs']['layout']['justifyContent'] = 'center';
		$output = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$this->assertStringContainsString( 'text-align: center', $output );
		$this->assertStringContainsString( 'align="center"', $output );
	}

	/**
	 * Test it escapes attributes.
	 */
	public function testItEscapesAttributes(): void {
		$parsed_block                                      = array(
			'innerBlocks' => array(
				array(
					'blockName' => 'dummy/block',
					'innerHTML' => 'Dummy 1',
				),
			),
			'email_attrs' => array(),
		);
		$parsed_block['attrs']['layout']['justifyContent'] = '"> <script>alert("XSS")</script><div style="text-align: right';
		$output = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$this->assertStringNotContainsString( '<script>alert("XSS")</script>', $output );
	}

	/**
	 * Test that the renderer computes proper widths for reasonable settings.
	 */
	public function testInComputesProperWidthsForReasonableSettings(): void {
		$parsed_block = array(
			'innerBlocks' => array(),
			'email_attrs' => array(
				'width' => '640px',
			),
		);

		// 50% and 25%
		$parsed_block['innerBlocks'] = array(
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 1',
				'attrs'     => array( 'width' => '50' ),
			),
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 2',
				'attrs'     => array( 'width' => '25' ),
			),
		);
		$output                      = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$flex_items                  = $this->getFlexItemsFromOutput( $output );
		$this->assertStringContainsString( 'width:312px;', $flex_items[0] );
		$this->assertStringContainsString( 'width:148px;', $flex_items[1] );

		// 25% and 25% and auto
		$parsed_block['innerBlocks'] = array(
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 1',
				'attrs'     => array( 'width' => '25' ),
			),
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 2',
				'attrs'     => array( 'width' => '25' ),
			),
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 3',
				'attrs'     => array(),
			),
		);
		$output                      = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$flex_items                  = $this->getFlexItemsFromOutput( $output );
		$this->assertStringContainsString( 'width:148px;', $flex_items[0] );
		$this->assertStringContainsString( 'width:148px;', $flex_items[1] );
		$this->assertStringNotContainsString( 'width:', $flex_items[2] );

		// 50% and 50%
		$parsed_block['innerBlocks'] = array(
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 1',
				'attrs'     => array( 'width' => '50' ),
			),
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 2',
				'attrs'     => array( 'width' => '50' ),
			),
		);
		$output                      = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$flex_items                  = $this->getFlexItemsFromOutput( $output );
		$this->assertStringContainsString( 'width:312px;', $flex_items[0] );
		$this->assertStringContainsString( 'width:312px;', $flex_items[1] );
	}

	/**
	 * Test that the renderer computes proper widths for strange settings values.
	 */
	public function testInComputesWidthsForStrangeSettingsValues(): void {
		$parsed_block = array(
			'innerBlocks' => array(),
			'email_attrs' => array(
				'width' => '640px',
			),
		);

		// 100% and 25%
		$parsed_block['innerBlocks'] = array(
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 1',
				'attrs'     => array( 'width' => '100' ),
			),
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 2',
				'attrs'     => array( 'width' => '25' ),
			),
		);
		$output                      = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$flex_items                  = $this->getFlexItemsFromOutput( $output );
		$this->assertStringContainsString( 'width:508px;', $flex_items[0] );
		$this->assertStringContainsString( 'width:105px;', $flex_items[1] );

		// 100% and 100%
		$parsed_block['innerBlocks'] = array(
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 1',
				'attrs'     => array( 'width' => '100' ),
			),
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 2',
				'attrs'     => array( 'width' => '100' ),
			),
		);
		$output                      = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$flex_items                  = $this->getFlexItemsFromOutput( $output );
		$this->assertStringContainsString( 'width:312px;', $flex_items[0] );
		$this->assertStringContainsString( 'width:312px;', $flex_items[1] );

		// 100% and auto
		$parsed_block['innerBlocks'] = array(
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 1',
				'attrs'     => array( 'width' => '100' ),
			),
			array(
				'blockName' => 'dummy/block',
				'innerHTML' => 'Dummy 2',
				'attrs'     => array(),
			),
		);
		$output                      = $this->renderer->render_inner_blocks_in_layout( $parsed_block, $this->rendering_context );
		$flex_items                  = $this->getFlexItemsFromOutput( $output );
		$this->assertStringContainsString( 'width:508px;', $flex_items[0] );
		$this->assertStringNotContainsString( 'width:', $flex_items[1] );
	}

	/**
	 * Get flex items from the output.
	 *
	 * @param string $output Output.
	 */
	private function getFlexItemsFromOutput( string $output ): array {
		$matches = array();
		preg_match_all( '/<td class="layout-flex-item" style="(.*)">/', $output, $matches );
		$match = $matches[0][0];
		$this->assertIsString( $match );
		return explode( '><', $match );
	}

	/**
	 * Render a dummy block.
	 *
	 * @param string $block_content Block content.
	 * @param array  $parsed_block Parsed block data.
	 * @return string
	 */
	public function renderDummyBlock( $block_content, $parsed_block ): string {
		$dummy_renderer = new Dummy_Block_Renderer();
		return $dummy_renderer->render( $block_content, $parsed_block, $this->rendering_context );
	}

	/**
	 * Clean up after each test.
	 */
	public function tearDown(): void {
		parent::tearDown();
		unregister_block_type( 'dummy/block' );
		remove_filter( 'render_block', array( $this, 'renderDummyBlock' ), 10 );
	}
}
