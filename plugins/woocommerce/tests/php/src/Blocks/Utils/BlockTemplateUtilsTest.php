<?php

namespace Automattic\PooCommerce\Tests\Blocks\Utils;

use Automattic\PooCommerce\Blocks\Options;
use Automattic\PooCommerce\Blocks\Utils\BlockTemplateUtils;
use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Blocks\BlockTemplatesRegistry;
use Automattic\PooCommerce\Blocks\TemplateOptions;
use WP_UnitTestCase;

/**
 * Tests for the BlockTemplateUtils class.
 */
class BlockTemplateUtilsTest extends WP_UnitTestCase {

	/**
	 * Holds an instance of the dependency injection container.
	 *
	 * @var Container
	 */
	private $container;

	/**
	 * Setup test environment.
	 */
	protected function setUp(): void {
		parent::setUp();

		// Switch to a block theme and initialize template logic.
		switch_theme( 'twentytwentytwo' );
		$this->container = Package::container();

		// We need to manually register the BlockTemplatesRegistry and
		// TemplateOptions classes because they are conditionally registered
		// in Bootstrap.php so they wouldn't run in the test environment.
		$this->container->register(
			BlockTemplatesRegistry::class,
			function () {
				return new BlockTemplatesRegistry();
			}
		);
		$this->container->register(
			TemplateOptions::class,
			function () {
				return new TemplateOptions();
			}
		);
		$this->container->get( TemplateOptions::class )->init();

		// Reset options.
		delete_option( Options::WC_BLOCK_USE_BLOCKIFIED_PRODUCT_GRID_BLOCK_AS_TEMPLATE );
		delete_option( Options::WC_BLOCK_VERSION );
	}

	/**
	 * Provides data for testing template_is_eligible_for_fallback functions.
	 */
	public function provideFallbackData() {
		return array(
			array( 'taxonomy-product_cat', true ),
			array( 'taxonomy-product_tag', true ),
			array( 'taxonomy-product_attribute', true ),
			array( 'single-product', false ),
		);
	}

	/**
	 * Test build_template_result_from_post.
	 */
	public function test_build_template_result_from_post() {
		$theme       = BlockTemplateUtils::PLUGIN_SLUG;
		$post_fields = array(
			'ID'           => 'the_post_id',
			'post_name'    => 'the_post_name',
			'post_content' => 'the_post_content',
			'post_type'    => 'the_post_type',
			'post_excerpt' => 'the_post_excerpt',
			'post_title'   => 'the_post_title',
			'post_status'  => 'the_post_status',
		);
		$post        = $this->createPost( $post_fields, $theme );

		$template = BlockTemplateUtils::build_template_result_from_post( $post );

		$this->assertEquals( $post->ID, $template->wp_id );
		$this->assertEquals( $theme . '//' . $post_fields['post_name'], $template->id );
		$this->assertEquals( $theme, $template->theme );
		$this->assertEquals( $post_fields['post_content'], $template->content );
		$this->assertEquals( $post_fields['post_name'], $template->slug );
		$this->assertEquals( 'custom', $template->source );
		$this->assertEquals( $post_fields['post_type'], $template->type );
		$this->assertEquals( $post_fields['post_excerpt'], $template->description );
		$this->assertEquals( $post_fields['post_title'], $template->title );
		$this->assertEquals( $post_fields['post_status'], $template->status );
		$this->assertEquals( 'plugin', $template->origin );
		$this->assertTrue( $template->has_theme_file );
		$this->assertFalse( $template->is_custom );
		$this->assertEmpty( $template->post_types );
	}

	/**
	 * Test build_template_result_from_file.
	 */
	public function test_build_template_result_from_file() {
		switch_theme( 'storefront' );
		$template_file = array(
			'slug'        => 'single-product',
			'id'          => 'poocommerce/poocommerce//single-product',
			'path'        => __DIR__ . '/single-product.html',
			'type'        => 'wp_template',
			'theme'       => 'poocommerce/poocommerce',
			'source'      => 'plugin',
			'title'       => 'Single Product',
			'description' => 'Displays a single product.',
		);

		$template = BlockTemplateUtils::build_template_result_from_file( $template_file, 'wp_template' );

		$this->assertEquals( BlockTemplateUtils::PLUGIN_SLUG . '//' . $template_file['slug'], $template->id );
		$this->assertEquals( BlockTemplateUtils::PLUGIN_SLUG, $template->theme );
		$this->assertStringContainsString( '"theme":"storefront"', $template->content );
		$this->assertEquals( $template_file['source'], $template->source );
		$this->assertEquals( $template_file['slug'], $template->slug );
		$this->assertEquals( 'wp_template', $template->type );
		$this->assertEquals( $template_file['title'], $template->title );
		$this->assertEquals( $template_file['description'], $template->description );
		$this->assertEquals( 'publish', $template->status );
		$this->assertTrue( $template->has_theme_file );
		$this->assertEquals( $template_file['source'], $template->origin );
		$this->assertFalse( $template->is_custom );
		$this->assertEmpty( $template->post_types );
		$this->assertEquals( 'uncategorized', $template->area );
	}

	/**
	 * Test create_new_block_template_object.
	 */
	public function test_create_new_block_template_object() {
		$expected_template = (object) array(
			'slug'        => 'single-product',
			'id'          => 'poocommerce/poocommerce//single-product',
			'path'        => __DIR__ . '/single-product.html',
			'type'        => 'wp_template',
			'theme'       => 'poocommerce/poocommerce',
			'source'      => 'plugin',
			'title'       => 'Single Product',
			'description' => '',
			'post_types'  => array(),
		);

		$template = BlockTemplateUtils::create_new_block_template_object(
			__DIR__ . '/single-product.html',
			'wp_template',
			'single-product',
			false
		);

		$this->assertEquals( $expected_template, $template );
	}

	/**
	 * Test remove_templates_with_custom_alternative.
	 */
	public function test_remove_templates_with_custom_alternative() {
		$templates = array(
			(object) array(
				'slug'   => 'single-product',
				'source' => 'theme',
				'theme'  => 'my-theme',
			),
			(object) array(
				'slug'   => 'taxonomy-product_tag',
				'source' => 'theme',
				'theme'  => 'my-theme',
			),
			(object) array(
				'slug'   => 'taxonomy-product_tag',
				'source' => 'custom',
				'theme'  => 'poocommerce',
			),
			(object) array(
				'slug'   => 'taxonomy-product_cat',
				'source' => 'theme',
				'theme'  => 'my-theme',
			),
			(object) array(
				'slug'   => 'taxonomy-product_cat',
				'source' => 'custom',
				'theme'  => 'poocommerce/poocommerce',
			),
		);

		$expected_templates = array(
			(object) array(
				'slug'   => 'single-product',
				'source' => 'theme',
				'theme'  => 'my-theme',
			),
			(object) array(
				'slug'   => 'taxonomy-product_tag',
				'source' => 'custom',
				'theme'  => 'poocommerce',
			),
			(object) array(
				'slug'   => 'taxonomy-product_cat',
				'source' => 'custom',
				'theme'  => 'poocommerce/poocommerce',
			),
		);

		$this->assertEquals( $expected_templates, BlockTemplateUtils::remove_templates_with_custom_alternative( $templates ) );
	}

	/**
	 * Test inject_theme_attribute_in_content with no template part.
	 */
	public function test_inject_theme_attribute_in_content_with_no_template_part() {
		$template_content = '<!-- wp:poocommerce/legacy-template {"template":"archive-product"} /-->';

		$this->assertEquals( $template_content, BlockTemplateUtils::inject_theme_attribute_in_content( $template_content ) );
	}

	/**
	 * Test inject_theme_attribute_in_content with a template part.
	 */
	public function test_inject_theme_attribute_in_content_with_template_parts() {
		switch_theme( 'storefront' );
		$template_content = '<!-- wp:template-part {"slug":"header","tagName":"header"} /-->';

		$expected_template_content = '<!-- wp:template-part {"slug":"header","tagName":"header","theme":"storefront"} /-->';

		$this->assertEquals( $expected_template_content, BlockTemplateUtils::inject_theme_attribute_in_content( $template_content ) );
	}

	/**
	 * Test a new installation with a classic theme.
	 */
	public function test_new_installation_with_a_classic_theme_should_not_use_blockified_templates() {
		switch_theme( 'storefront' );

		$this->assertFalse( BlockTemplateUtils::should_use_blockified_product_grid_templates() );
	}

	/**
	 * Test a new installation with a block theme.
	 */
	public function test_new_installation_with_a_block_theme_should_use_blockified_templates() {
		switch_theme( 'twentytwentytwo' );

		$this->assertTrue( BlockTemplateUtils::should_use_blockified_product_grid_templates() );
	}

	/**
	 * Test a new installation with a classic theme switching to a block theme.
	 */
	public function test_new_installation_with_a_classic_theme_switching_to_a_block_should_use_blockified_templates() {
		switch_theme( 'storefront' );

		switch_theme( 'twentytwentytwo' );
		check_theme_switched();

		$this->assertTrue( BlockTemplateUtils::should_use_blockified_product_grid_templates() );
	}

	/**
	 * Test a plugin update with a classic theme.
	 */
	public function test_plugin_update_with_a_classic_theme_should_not_use_blockified_templates() {
		switch_theme( 'storefront' );

		$this->update_plugin();

		$this->assertFalse( BlockTemplateUtils::should_use_blockified_product_grid_templates() );
	}

	/**
	 * Test a plugin update with a block theme.
	 */
	public function test_plugin_update_with_a_block_theme_should_not_use_blockified_templates() {
		switch_theme( 'twentytwentytwo' );

		$this->update_plugin();

		$this->assertFalse( BlockTemplateUtils::should_use_blockified_product_grid_templates() );
	}

	/**
	 * Test a plugin update with a classic theme switching to a block theme.
	 */
	public function test_plugin_update_with_a_classic_theme_switching_to_a_block_should_use_blockified_templates() {
		switch_theme( 'storefront' );

		$this->update_plugin();

		switch_theme( 'twentytwentytwo' );
		check_theme_switched();

		$this->assertTrue( BlockTemplateUtils::should_use_blockified_product_grid_templates() );
	}

	/**
	 * Test switching between block themes when the option is already defined.
	 */
	public function test_switching_between_block_themes_should_change_usage_of_blockified_templates() {
		// Switching block themes when the option is already true.
		update_option( Options::WC_BLOCK_USE_BLOCKIFIED_PRODUCT_GRID_BLOCK_AS_TEMPLATE, wc_bool_to_string( true ) );
		switch_theme( 'twentytwentytwo' );
		check_theme_switched();
		$this->assertTrue( BlockTemplateUtils::should_use_blockified_product_grid_templates() );

		// Switching block themes when the option is false.
		update_option( Options::WC_BLOCK_USE_BLOCKIFIED_PRODUCT_GRID_BLOCK_AS_TEMPLATE, wc_bool_to_string( false ) );
		switch_theme( 'twentytwentytwo' );
		check_theme_switched();
		$this->assertFalse( BlockTemplateUtils::should_use_blockified_product_grid_templates() );

		delete_option( Options::WC_BLOCK_USE_BLOCKIFIED_PRODUCT_GRID_BLOCK_AS_TEMPLATE );
	}

	/**
	 * Runs the migration that happen after a plugin update
	 *
	 * @return void
	 */
	public function update_plugin(): void {
		update_option( Options::WC_BLOCK_VERSION, 1 );
		update_option( Options::WC_BLOCK_USE_BLOCKIFIED_PRODUCT_GRID_BLOCK_AS_TEMPLATE, wc_bool_to_string( false ) );
	}

	/**
	 * Creates a post with a theme term.
	 *
	 * @param array  $post Post data.
	 * @param string $theme Theme name.
	 *
	 * @return WP_Post
	 */
	private function createPost( $post, $theme ) {
		$term = wp_insert_term( $theme, 'wp_theme' );

		$post_id = wp_insert_post( $post );
		wp_set_post_terms( $post_id, array( $term['term_id'] ), 'wp_theme' );

		return get_post( $post_id );
	}
}
