<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\EmailEditor;

use Automattic\PooCommerce\EmailEditor\Email_Editor_Container;
use Automattic\PooCommerce\EmailEditor\Engine\Dependency_Check;
use Automattic\PooCommerce\Internal\EmailEditor\EmailPatterns\PatternsController;
use Automattic\PooCommerce\Internal\EmailEditor\EmailTemplates\TemplatesController;
use Automattic\PooCommerce\Internal\EmailEditor\WCTransactionalEmails\WCTransactionalEmails;
use Automattic\PooCommerce\Internal\EmailEditor\WCTransactionalEmails\WCTransactionalEmailPostsManager;
use Automattic\PooCommerce\Internal\EmailEditor\EmailTemplates\TemplateApiController;
use WP_Post;

defined( 'ABSPATH' ) || exit;

/**
 * Integration class for the Email Editor functionality.
 */
class Integration {
	const EMAIL_POST_TYPE = 'woo_email';

	const WC_EMAIL_TYPE_ID_POST_META_KEY = '_wc_email_type';

	/**
	 * The email editor page renderer instance.
	 *
	 * @var PageRenderer
	 */
	private PageRenderer $editor_page_renderer;

	/**
	 * The dependency check instance.
	 *
	 * @var Dependency_Check
	 */
	private Dependency_Check $dependency_check;

	/**
	 * The template API controller instance.
	 *
	 * @var TemplateApiController
	 */
	private TemplateApiController $template_api_controller;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$editor_container       = Email_Editor_Container::container();
		$this->dependency_check = $editor_container->get( Dependency_Check::class );
	}

	/**
	 * Initialize the integration.
	 *
	 * @internal
	 */
	final public function init(): void {
		if ( ! $this->dependency_check->are_dependencies_met() ) {
			// If dependencies are not met, do not initialize the email editor integration.
			return;
		}

		add_action( 'poocommerce_init', array( $this, 'initialize' ) );
	}

	/**
	 * Initialize the integration.
	 */
	public function initialize() {
		$this->init_hooks();
		$this->extend_template_post_api();
		$this->register_hooks();
	}

	/**
	 * Initialize hooks for required classes.
	 */
	public function init_hooks() {
		$container = wc_get_container();
		$container->get( PatternsController::class );
		$container->get( TemplatesController::class );
		$container->get( PersonalizationTagManager::class );
		$container->get( BlockEmailRenderer::class );
		$container->get( WCTransactionalEmails::class );
		$this->editor_page_renderer    = $container->get( PageRenderer::class );
		$this->template_api_controller = $container->get( TemplateApiController::class );
	}

	/**
	 * Register hooks for the integration.
	 */
	public function register_hooks() {
		add_filter( 'poocommerce_email_editor_post_types', array( $this, 'add_email_post_type' ) );
		add_filter( 'poocommerce_is_email_editor_page', array( $this, 'is_editor_page' ), 10, 1 );
		add_filter( 'replace_editor', array( $this, 'replace_editor' ), 10, 2 );
		add_action( 'before_delete_post', array( $this, 'delete_email_template_associated_with_email_editor_post' ), 10, 2 );
	}

	/**
	 * Add PooCommerce email post type to the list of supported post types.
	 *
	 * @param array $post_types List of post types.
	 * @return array Modified list of post types.
	 */
	public function add_email_post_type( array $post_types ): array {
		$post_types[] = array(
			'name' => self::EMAIL_POST_TYPE,
			'args' => array(
				'labels'   => array(
					'name'          => __( 'Woo Emails', 'poocommerce' ),
					'singular_name' => __( 'Woo Email', 'poocommerce' ),
					'add_new_item'  => __( 'Add New Woo Email', 'poocommerce' ),
					'edit_item'     => __( 'Edit Woo Email', 'poocommerce' ),
					'new_item'      => __( 'New Woo Email', 'poocommerce' ),
					'view_item'     => __( 'View Woo Email', 'poocommerce' ),
					'search_items'  => __( 'Search Woo Emails', 'poocommerce' ),
				),
				'rewrite'  => array( 'slug' => self::EMAIL_POST_TYPE ),
				'supports' => array(
					'title',
					'editor' => array(
						'default-mode' => 'template-locked',
					),
				),
			),
		);
		return $post_types;
	}

	/**
	 * Check if current page is email editor page.
	 *
	 * @param bool $is_editor_page Current editor page status.
	 * @return bool Whether current page is email editor page.
	 */
	public function is_editor_page( bool $is_editor_page ): bool {
		if ( $is_editor_page ) {
			return $is_editor_page;
		}

		// We need to check early if we are on the email editor page. The check runs early so we can't use current_screen() here.
		if ( is_admin() && isset( $_GET['post'] ) && isset( $_GET['action'] ) && 'edit' === $_GET['action'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- We are not verifying the nonce here because we are not using the nonce in the function and the data is okay in this context (WP-admin errors out gracefully).
			$post = get_post( (int) $_GET['post'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- We are not verifying the nonce here because we are not using the nonce in the function and the data is okay in this context (WP-admin errors out gracefully).
			return $post && self::EMAIL_POST_TYPE === $post->post_type;
		}

		return false;
	}

	/**
	 * Replace the default editor with our custom email editor.
	 *
	 * @param bool    $replace Whether to replace the editor.
	 * @param WP_Post $post    Post object.
	 * @return bool Whether the editor was replaced.
	 */
	public function replace_editor( $replace, $post ) {
		$current_screen = get_current_screen();
		if ( self::EMAIL_POST_TYPE === $post->post_type && $current_screen ) {
			$this->editor_page_renderer->render();
			return true;
		}
		return $replace;
	}

	/**
	 * Delete the email template associated with the email editor post when the post is permanently deleted.
	 *
	 * @param int     $post_id The post ID.
	 * @param WP_Post $post    The post object.
	 */
	public function delete_email_template_associated_with_email_editor_post( $post_id, $post ) {
		if ( self::EMAIL_POST_TYPE !== $post->post_type ) {
			return;
		}

		$email_type = get_post_meta( $post_id, self::WC_EMAIL_TYPE_ID_POST_META_KEY, true );

		if ( empty( $email_type ) ) {
			return;
		}

		WCTransactionalEmailPostsManager::get_instance()->delete_email_template( $email_type );
	}

	/**
	 * Extend the post API for the wp_template post type to add and save the poocommerce_data field.
	 */
	public function extend_template_post_api(): void {
		register_rest_field(
			'wp_template',
			'poocommerce_data',
			array(
				'get_callback'    => array( $this->template_api_controller, 'get_template_data' ),
				'update_callback' => array( $this->template_api_controller, 'save_template_data' ),
				'schema'          => $this->template_api_controller->get_template_data_schema(),
			)
		);
	}
}
