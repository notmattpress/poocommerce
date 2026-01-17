<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine\Templates;

/**
 * Integration test for the Templates class
 */
class Templates_Test extends \Email_Editor_Integration_Test_Case {

	/**
	 * Templates.
	 *
	 * @var Templates
	 */
	private Templates $templates;

	/**
	 * Set up before each test
	 */
	public function setUp(): void {
		parent::setUp();
		$this->templates = $this->di_container->get( Templates::class );
	}

	/**
	 * Test it can fetch block template
	 *
	 * @return void
	 */
	public function testItCanFetchBlockTemplate(): void {
		$this->templates->initialize( array( 'poocommerce_email' ) );
		$template = $this->templates->get_block_template( 'email-general' );

		self::assertInstanceOf( \WP_Block_Template::class, $template );
		$this->assertEquals( 'email-general', $template->slug );
		$this->assertStringContainsString( 'email-general', $template->id );
		$this->assertEquals( 'General Email', $template->title );
		$this->assertEquals( 'A general template for emails.', $template->description );
	}

	/**
	 * Test that action for registering templates is triggered
	 *
	 * @return void
	 */
	public function testItTriggersActionForRegisteringTemplates(): void {
		$trigger_check = false;
		add_filter(
			'poocommerce_email_editor_register_templates',
			function ( $registry ) use ( &$trigger_check ) {
				$trigger_check = true;
				return $registry;
			}
		);
		$this->templates->initialize( array( 'poocommerce_email' ) );
		$this->assertTrue( $trigger_check );
	}
}
