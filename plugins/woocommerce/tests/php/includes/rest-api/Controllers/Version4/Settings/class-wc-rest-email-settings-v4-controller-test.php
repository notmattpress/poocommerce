<?php
/**
 * Email Settings V4 controller unit tests.
 *
 * @package PooCommerce\RestApi\UnitTests
 * @since   4.0.0
 */

declare(strict_types=1);

/**
 * Email Settings V4 controller unit tests.
 *
 * @package PooCommerce\RestApi\UnitTests
 * @since   4.0.0
 */
class WC_REST_Email_Settings_V4_Controller_Test extends WC_REST_Unit_Test_Case {

	/**
	 * User ID.
	 *
	 * @var int
	 */
	private $user_id;

	/**
	 * @var callable
	 */
	private $feature_filter;

	/**
	 * Previous option values to restore after tests.
	 *
	 * @var array<string, mixed>
	 */
	private $prev_options = array();

	/**
	 * Setup.
	 */
	public function setUp(): void {
		// Enable the v4 REST API feature before bootstrapping.
		$this->feature_filter = function ( $features ) {
			$features[] = 'rest-api-v4';
			return $features;
		};

		add_filter( 'poocommerce_admin_features', $this->feature_filter );

		parent::setUp();
		// Enable block email editor feature to test reply-to fields.
		update_option( 'poocommerce_feature_block_email_editor_enabled', 'yes' );

		// Snapshot current option values to restore on tearDown.
		$option_ids = array(
			'poocommerce_email_from_name',
			'poocommerce_email_from_address',
			'poocommerce_email_reply_to_enabled',
			'poocommerce_email_reply_to_name',
			'poocommerce_email_reply_to_address',
		);
		foreach ( $option_ids as $id ) {
			$this->prev_options[ $id ] = get_option( $id, null );
		}

		// Create a user with permissions.
		$this->user_id = $this->factory->user->create(
			array(
				'role' => 'shop_manager',
			)
		);
	}

	/**
	 * Tear down.
	 */
	public function tearDown(): void {
		if ( isset( $this->feature_filter ) ) {
			remove_filter( 'poocommerce_admin_features', $this->feature_filter );
		}

		// Restore previous option values.
		foreach ( $this->prev_options as $id => $value ) {
			if ( null === $value ) {
				delete_option( (string) $id );
			} else {
				update_option( (string) $id, $value );
			}
		}

		// Disable block email editor feature.
		update_option( 'poocommerce_feature_block_email_editor_enabled', 'no' );
		parent::tearDown();
	}

	/**
	 * Test route registration.
	 */
	public function test_register_routes() {
		$routes = $this->server->get_routes();
		$this->assertArrayHasKey( '/wc/v4/settings/email', $routes );
	}

	/**
	 * Test getting email settings with block email editor enabled.
	 * Reply-to fields should be present, but design fields should not be present.
	 */
	public function test_get_item() {
		wp_set_current_user( $this->user_id );
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/email' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 'email', $data['id'] );
		$this->assertArrayHasKey( 'groups', $data );
		$this->assertArrayHasKey( 'values', $data );

		// Extra assertions on groups structure.
		$this->assertIsArray( $data['groups'] );
		// Groups are now dynamically generated from settings structure.
		// With block email editor enabled, we expect 'email_options' group.
		$this->assertArrayHasKey( 'email_options', $data['groups'] );
		$this->assertArrayHasKey( 'fields', $data['groups']['email_options'] );
		$this->assertNotEmpty( $data['groups']['email_options']['fields'] );
		// Verify the group has expected structure.
		$this->assertArrayHasKey( 'title', $data['groups']['email_options'] );
		$this->assertArrayHasKey( 'description', $data['groups']['email_options'] );
		$this->assertArrayHasKey( 'order', $data['groups']['email_options'] );

		// Extra assertions on values keys.
		$this->assertIsArray( $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_from_name', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_from_address', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_reply_to_enabled', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_reply_to_name', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_reply_to_address', $data['values'] );

		// Design fields should NOT be present when block email editor is enabled.
		$this->assertArrayNotHasKey( 'poocommerce_email_header_image', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_header_image_width', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_header_alignment', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_font_family', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_footer_text', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_base_color', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_background_color', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_body_background_color', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_text_color', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_footer_text_color', $data['values'] );

		// Design-related groups should NOT exist when block email editor is enabled.
		$this->assertArrayNotHasKey( 'email_template_options', $data['groups'] );
		$this->assertArrayNotHasKey( 'email_color_palette', $data['groups'] );
	}

	/**
	 * Test getting email settings when block email editor is disabled.
	 * Reply-to fields should not be present, but design fields should be present.
	 */
	public function test_get_item_without_block_email_editor() {
		// Disable block email editor feature.
		update_option( 'poocommerce_feature_block_email_editor_enabled', 'no' );

		wp_set_current_user( $this->user_id );
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/email' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 'email', $data['id'] );
		$this->assertArrayHasKey( 'groups', $data );
		$this->assertArrayHasKey( 'values', $data );

		// Extra assertions on values keys.
		$this->assertIsArray( $data['values'] );
		// Basic email fields should be present.
		$this->assertArrayHasKey( 'poocommerce_email_from_name', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_from_address', $data['values'] );

		// Reply-to fields should NOT be present when block email editor is disabled.
		$this->assertArrayNotHasKey( 'poocommerce_email_reply_to_enabled', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_reply_to_name', $data['values'] );
		$this->assertArrayNotHasKey( 'poocommerce_email_reply_to_address', $data['values'] );

		// Design fields SHOULD be present when block email editor is disabled.
		$this->assertArrayHasKey( 'poocommerce_email_header_image', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_header_image_width', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_header_alignment', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_font_family', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_footer_text', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_base_color', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_background_color', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_body_background_color', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_text_color', $data['values'] );
		$this->assertArrayHasKey( 'poocommerce_email_footer_text_color', $data['values'] );

		// Verify the email_options group exists and does not contain reply-to fields.
		if ( isset( $data['groups']['email_options'] ) && isset( $data['groups']['email_options']['fields'] ) ) {
			$field_ids = array_column( $data['groups']['email_options']['fields'], 'id' );
			$this->assertContains( 'poocommerce_email_from_name', $field_ids );
			$this->assertContains( 'poocommerce_email_from_address', $field_ids );
			$this->assertNotContains( 'poocommerce_email_reply_to_enabled', $field_ids );
			$this->assertNotContains( 'poocommerce_email_reply_to_name', $field_ids );
			$this->assertNotContains( 'poocommerce_email_reply_to_address', $field_ids );
		}

		// Verify email template options group exists with design fields.
		$this->assertArrayHasKey( 'email_template_options', $data['groups'] );
		if ( isset( $data['groups']['email_template_options']['fields'] ) ) {
			$template_field_ids = array_column( $data['groups']['email_template_options']['fields'], 'id' );
			$this->assertContains( 'poocommerce_email_header_image', $template_field_ids );
			$this->assertContains( 'poocommerce_email_font_family', $template_field_ids );
			$this->assertContains( 'poocommerce_email_footer_text', $template_field_ids );
		}

		// Verify color palette group exists with color fields.
		$this->assertArrayHasKey( 'email_color_palette', $data['groups'] );
		if ( isset( $data['groups']['email_color_palette']['fields'] ) ) {
			$color_field_ids = array_column( $data['groups']['email_color_palette']['fields'], 'id' );
			$this->assertContains( 'poocommerce_email_base_color', $color_field_ids );
			$this->assertContains( 'poocommerce_email_background_color', $color_field_ids );
			$this->assertContains( 'poocommerce_email_body_background_color', $color_field_ids );
			$this->assertContains( 'poocommerce_email_text_color', $color_field_ids );
			$this->assertContains( 'poocommerce_email_footer_text_color', $color_field_ids );
		}
	}

	/**
	 * Test updating email settings.
	 */
	public function test_update_item() {
		wp_set_current_user( $this->user_id );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/email' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'values' => array(
						'poocommerce_email_from_name'     => 'Test Sender',
						'poocommerce_email_from_address'  => 'sender@example.com',
						'poocommerce_email_reply_to_enabled' => true,
						'poocommerce_email_reply_to_name' => 'Reply Name',
						'poocommerce_email_reply_to_address' => 'reply@example.com',
					),
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 'Test Sender', get_option( 'poocommerce_email_from_name' ) );
		$this->assertEquals( 'sender@example.com', get_option( 'poocommerce_email_from_address' ) );
		$this->assertEquals( 'yes', get_option( 'poocommerce_email_reply_to_enabled' ) );
		$this->assertEquals( 'Reply Name', get_option( 'poocommerce_email_reply_to_name' ) );
		$this->assertEquals( 'reply@example.com', get_option( 'poocommerce_email_reply_to_address' ) );
	}

	/**
	 * Test updating email settings with invalid reply-to name.
	 * When reply-to is enabled, the name is required.
	 */
	public function test_update_item_with_invalid_reply_to_name() {
		wp_set_current_user( $this->user_id );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/email' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'values' => array(
						'poocommerce_email_reply_to_enabled' => true,
						'poocommerce_email_reply_to_name' => '',
						'poocommerce_email_reply_to_address' => '',
					),
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$response->get_data();
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'Reply-to name cannot be empty when reply-to is enabled.', $response->get_data()['message'] );
	}

	/**
	 * Test updating email settings with invalid reply-to address.
	 * When reply-to is enabled, the name is required.
	 */
	public function test_update_item_with_invalid_reply_to_address() {
		wp_set_current_user( $this->user_id );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/email' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'values' => array(
						'poocommerce_email_reply_to_enabled' => true,
						'poocommerce_email_reply_to_name' => 'Name',
						'poocommerce_email_reply_to_address' => 'invalid',
					),
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$response->get_data();
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'Please enter a valid reply-to email address.', $response->get_data()['message'] );
	}

	/**
	 * Test getting email settings without permission.
	 */
	public function test_get_item_without_permission() {
		wp_set_current_user( 0 );
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/email' );
		$response = $this->server->dispatch( $request );
		$response->get_data();

		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * Test updating email settings without permission.
	 */
	public function test_update_item_without_permission() {
		wp_set_current_user( 0 );
		$request = new WP_REST_Request( 'PUT', '/wc/v4/settings/email' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'poocommerce_email_from_name' => 'Test Sender',
				)
			)
		);
		$response = $this->server->dispatch( $request );
		$response->get_data();

		$this->assertEquals( 401, $response->get_status() );
	}
}
