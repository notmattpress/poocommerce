<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine\Renderer;

use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Postprocessors\Highlighting_Postprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Postprocessors\Variables_Postprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Postprocessors\Border_Style_Postprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Blocks_Width_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Cleanup_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Quote_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Spacing_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Typography_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Process_Manager;

/**
 * Unit test class for Process_Manager.
 */
class Process_Manager_Test extends \Email_Editor_Unit_Test {
	/**
	 * Test it calls preprocessors properly.
	 */
	public function testItCallsPreprocessorsProperly(): void {
		$layout = array(
			'contentSize' => '600px',
		);
		$styles = array(
			'spacing' => array(
				'blockGap' => '0px',
				'padding'  => array(
					'bottom' => '0px',
					'left'   => '0px',
					'right'  => '0px',
					'top'    => '0px',
				),
			),
		);

		$cleanup = $this->createMock( Cleanup_Preprocessor::class );
		$cleanup->expects( $this->once() )->method( 'preprocess' )->willReturn( array() );

		$blocks_width = $this->createMock( Blocks_Width_Preprocessor::class );
		$blocks_width->expects( $this->once() )->method( 'preprocess' )->willReturn( array() );

		$typography = $this->createMock( Typography_Preprocessor::class );
		$typography->expects( $this->once() )->method( 'preprocess' )->willReturn( array() );

		$spacing = $this->createMock( Spacing_Preprocessor::class );
		$spacing->expects( $this->once() )->method( 'preprocess' )->willReturn( array() );

		$quote_text_align = $this->createMock( Quote_Preprocessor::class );
		$quote_text_align->expects( $this->once() )->method( 'preprocess' )->willReturn( array() );

		$highlighting = $this->createMock( Highlighting_Postprocessor::class );
		$highlighting->expects( $this->once() )->method( 'postprocess' )->willReturn( '' );

		$variables = $this->createMock( Variables_Postprocessor::class );
		$variables->expects( $this->once() )->method( 'postprocess' )->willReturn( '' );

		$border_style = $this->createMock( Border_Style_Postprocessor::class );
		$border_style->expects( $this->once() )->method( 'postprocess' )->willReturn( '' );

		$process_nanager = new Process_Manager( $cleanup, $blocks_width, $typography, $spacing, $quote_text_align, $highlighting, $variables, $border_style );
		$this->assertEquals( array(), $process_nanager->preprocess( array(), $layout, $styles ) );
		$this->assertEmpty( $process_nanager->postprocess( '' ) );
	}
}
