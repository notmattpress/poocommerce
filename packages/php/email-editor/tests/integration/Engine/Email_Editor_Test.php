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
	 * A logged out visitor should not see a draft email passed via ?post=.
	 */
	public function testItDoesNotRenderUnpublishedEmailForAnonymousVisitor(): void {
		wp_set_current_user( 0 );
		$post_id      = $this->create_email_post( 'draft' );
		$_GET['post'] = (string) $post_id;
		$fallback     = 'fallback-template.php';

		$template = $this->email_editor->load_email_preview_template( $fallback );

		$this->assertSame( $fallback, $template );
	}

	/**
	 * Published emails stay public so preview in a new tab keeps working.
	 */
	public function testItRendersPublishedEmailForAnonymousVisitor(): void {
		wp_set_current_user( 0 );
		$post_id      = $this->create_email_post( 'publish' );
		$_GET['post'] = (string) $post_id;

		$template = $this->email_editor->load_email_preview_template( 'fallback-template.php' );

		$this->assertStringEndsWith( 'single-email-post-template.php', $template );
	}

	/**
	 * A user who can read the email can still preview it while it is a draft.
	 */
	public function testItRendersUnpublishedEmailForUserWithReadAccess(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$this->assertIsInt( $user_id );
		wp_set_current_user( $user_id );
		$post_id      = $this->create_email_post( 'draft' );
		$_GET['post'] = (string) $post_id;

		$template = $this->email_editor->load_email_preview_template( 'fallback-template.php' );

		$this->assertStringEndsWith( 'single-email-post-template.php', $template );
	}

	/**
	 * Create an email post of the registered custom type.
	 *
	 * @param string $status The post status.
	 * @return int The created post ID.
	 */
	private function create_email_post( string $status ): int {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'custom_email_type',
				'post_status' => $status,
			)
		);
		$this->assertIsInt( $post_id );
		return $post_id;
	}

	/**
	 * Clean up after each test
	 */
	public function tearDown(): void {
		unset( $_GET['post'] );
		parent::tearDown();
		remove_filter( 'poocommerce_email_editor_post_types', $this->post_register_callback );
	}
}
