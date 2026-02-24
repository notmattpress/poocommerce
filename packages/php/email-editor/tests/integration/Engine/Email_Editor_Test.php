<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine;

use Automattic\PooCommerce\EmailEditor\Engine\Email_Editor;
use Automattic\PooCommerce\EmailEditor\Engine\Email_Api_Controller;
use Automattic\PooCommerce\EmailEditor\Engine\Templates\Templates;
use Automattic\PooCommerce\EmailEditor\Engine\Patterns\Patterns;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;

/**
 * Integration test for Email_Editor class
 */
class Email_Editor_Test extends \Email_Editor_Integration_Test_Case {
	/**
	 * Email editor instance
	 *
	 * @var Email_Editor
	 */
	private $email_editor;

	/**
	 * Callback to register custom post type
	 *
	 * @var callable
	 */
	private $post_register_callback;

	/**
	 * Set up before each test
	 */
	public function setUp(): void {
		parent::setUp();
		$this->email_editor           = $this->di_container->get( Email_Editor::class );
		$this->post_register_callback = function ( $post_types ) {
			$post_types[] = array(
				'name' => 'custom_email_type',
				'args' => array(),
				'meta' => array(),
			);
			return $post_types;
		};
		add_filter( 'poocommerce_email_editor_post_types', $this->post_register_callback );
		$this->email_editor->initialize();
	}

	/**
	 * Test if the email register custom post type
	 */
	public function testItRegistersCustomPostTypeAddedViaHook(): void {
		$post_types = get_post_types();
		$this->assertArrayHasKey( 'custom_email_type', $post_types );
	}

	/**
	 * Clean up after each test
	 */
	public function tearDown(): void {
		parent::tearDown();
		remove_filter( 'poocommerce_email_editor_post_types', $this->post_register_callback );
	}
}
