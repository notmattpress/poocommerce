<?php // phpcs:ignore Generic.PHP.RequireStrictTypes.MissingDeclaration

namespace Automattic\PooCommerce\Tests\Blocks\Utils;

use Automattic\PooCommerce\Blocks\Utils\CartCheckoutUtils;
use Automattic\PooCommerce\Tests\Blocks\Mocks\CartCheckoutUtilsMock;
use WP_UnitTestCase;

/**
 * Tests for the CartCheckoutUtils class.
 */
class CartCheckoutUtilsTest extends WP_UnitTestCase {


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

		delete_option( 'poocommerce_checkout_phone_field' );
		delete_option( 'poocommerce_checkout_company_field' );
		delete_option( 'poocommerce_checkout_address_2_field' );
	}

	/**
	 * Test migrate_checkout_block_field_visibility_attributes() function.
	 */
	public function test_migrate_checkout_block_field_visibility_attributes() {
		// Default migration without checkout page.
		delete_option( 'poocommerce_checkout_page_id' );

		CartCheckoutUtilsMock::migrate_checkout_block_field_visibility_attributes_test();
		$this->assertEquals( 'optional', get_option( 'poocommerce_checkout_phone_field' ) );
		$this->assertEquals( 'hidden', get_option( 'poocommerce_checkout_company_field' ) );
		$this->assertEquals( 'optional', get_option( 'poocommerce_checkout_address_2_field' ) );

		// Populate checkout page.
		$page = array(
			'name'    => 'blocks-page',
			'title'   => 'Checkout',
			'content' => '',
		);

		$page_id         = wc_create_page( $page['name'], 'poocommerce_checkout_page_id', $page['title'], $page['content'] );
		$updated_content = '<!-- wp:poocommerce/checkout {"showApartmentField":false,"showCompanyField":false,"showPhoneField":false,"requireApartmentField":false,"requireCompanyField":false,"requirePhoneField":false} --> <div class="wp-block-poocommerce-checkout is-loading"></div> <!-- /wp:poocommerce/checkout -->';
		wp_update_post(
			[
				'ID'           => $page_id,
				'post_content' => $updated_content,
			]
		);

		CartCheckoutUtilsMock::migrate_checkout_block_field_visibility_attributes_test();
		$this->assertEquals( 'hidden', get_option( 'poocommerce_checkout_phone_field' ) );
		$this->assertEquals( 'hidden', get_option( 'poocommerce_checkout_company_field' ) );
		$this->assertEquals( 'hidden', get_option( 'poocommerce_checkout_address_2_field' ) );

		// Repeat with different settings.
		$updated_content = '<!-- wp:poocommerce/checkout {"showApartmentField":true,"showCompanyField":true,"showPhoneField":true,"requireApartmentField":true,"requireCompanyField":true,"requirePhoneField":true} --> <div class="wp-block-poocommerce-checkout is-loading"></div> <!-- /wp:poocommerce/checkout -->';
		wp_update_post(
			[
				'ID'           => $page_id,
				'post_content' => $updated_content,
			]
		);

		CartCheckoutUtilsMock::migrate_checkout_block_field_visibility_attributes_test();
		$this->assertEquals( 'required', get_option( 'poocommerce_checkout_phone_field' ) );
		$this->assertEquals( 'required', get_option( 'poocommerce_checkout_company_field' ) );
		$this->assertEquals( 'required', get_option( 'poocommerce_checkout_address_2_field' ) );
	}

	/**
	 * Test has_cart_page() function.
	 */
	public function test_has_cart_page() {
		wc_create_page( 'cart', 'poocommerce_cart_page_id', 'Cart', '' );
		$this->assertTrue( CartCheckoutUtils::has_cart_page() );
		delete_option( 'poocommerce_cart_page_id' );
		$this->assertFalse( CartCheckoutUtils::has_cart_page() );
	}

	/**
	 * Test finding express checkout attributes in top-level blocks.
	 */
	public function test_find_express_checkout_attributes_top_level() {
		$post_content = '<!-- wp:poocommerce/cart-express-payment-block {"buttonStyle":"dark","buttonHeight":48} /-->';

		$result = CartCheckoutUtils::find_express_checkout_attributes( $post_content, 'cart' );

		$this->assertEquals(
			array(
				'buttonStyle'  => 'dark',
				'buttonHeight' => 48,
			),
			$result
		);
	}

	/**
	 * Test finding express checkout attributes in nested blocks.
	 */
	public function test_find_express_checkout_attributes_nested() {
		$post_content = '<!-- wp:poocommerce/cart -->
    <!-- wp:poocommerce/cart-express-payment-block {"buttonStyle":"light","buttonHeight":48} /-->
    <!-- /wp:poocommerce/cart -->';

		$result = CartCheckoutUtils::find_express_checkout_attributes( $post_content, 'cart' );

		$this->assertEquals(
			array(
				'buttonStyle'  => 'light',
				'buttonHeight' => 48,
			),
			$result
		);
	}

	/**
	 * Test finding express checkout returns null when no block is present.
	 */
	public function test_find_express_checkout_attributes_not_found() {
		$post_content = '<!-- wp:paragraph --> <p>This is a paragraph block.</p> <!-- /wp:paragraph -->';

		$result = CartCheckoutUtils::find_express_checkout_attributes( $post_content, 'cart' );

		$this->assertNull( $result );
	}

	/**
	 * Data provider for has_block_variation test cases
	 *
	 * @return array
	 */
	public function hasBlockVariationDataProvider(): array {
		return array(
			// Test case name => [block_id, attribute, value, content, expected_result].
			'empty_content'                                => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'',
				false,
			),
			'null_content'                                 => array(
				'poocommerce/cart',
				'displayType',
				'full',
				null,
				false,
			),
			'block_doesnt_exist'                           => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:paragraph --><p>Some content</p><!-- /wp:paragraph -->',
				false,
			),
			'attribute_value_mismatch'                     => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:poocommerce/cart {"displayType":"compact"} -->',
				false,
			),
			'attribute_doesnt_exist'                       => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:poocommerce/cart {"someOtherAttr":"value"} -->',
				false,
			),
			'successful_match'                             => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:poocommerce/cart {"displayType":"full"} -->',
				true,
			),
			'multiple_blocks_one_matches'                  => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:paragraph --><p>Content</p><!-- /wp:paragraph -->
				<!-- wp:poocommerce/cart {"displayType":"compact"} -->
				<!-- wp:poocommerce/cart {"displayType":"full"} -->',
				true,
			),
			'classic_shortcode_empty_attrs_defaults_to_cart' => array(
				'poocommerce/classic-shortcode',
				'shortcode',
				'cart',
				'<!-- wp:poocommerce/classic-shortcode {} -->',
				true,
			),
			'classic_shortcode_no_attrs_defaults_to_cart'  => array(
				'poocommerce/classic-shortcode',
				'shortcode',
				'cart',
				'<!-- wp:poocommerce/classic-shortcode -->',
				true,
			),
			'classic_shortcode_explicit_cart'              => array(
				'poocommerce/classic-shortcode',
				'shortcode',
				'cart',
				'<!-- wp:poocommerce/classic-shortcode {"shortcode":"cart"} -->',
				true,
			),
			'classic_shortcode_different_value'            => array(
				'poocommerce/classic-shortcode',
				'shortcode',
				'cart',
				'<!-- wp:poocommerce/classic-shortcode {"shortcode":"checkout"} -->',
				false,
			),
			'classic_shortcode_special_case_only_for_cart' => array(
				'poocommerce/classic-shortcode',
				'shortcode',
				'checkout',
				'<!-- wp:poocommerce/classic-shortcode -->',
				false,
			),
			'string_numeric_match'                         => array(
				'poocommerce/product-gallery',
				'columns',
				'3',
				'<!-- wp:poocommerce/product-gallery {"columns":"3"} -->',
				true,
			),
			'strict_comparison_type_mismatch'              => array(
				'poocommerce/product-gallery',
				'columns',
				'3',
				'<!-- wp:poocommerce/product-gallery {"columns":3} -->',
				false,
			),
			'boolean_attribute_true'                       => array(
				'poocommerce/cart',
				'showShipping',
				true,
				'<!-- wp:poocommerce/cart {"showShipping":true} -->',
				true,
			),
			'boolean_attribute_false'                      => array(
				'poocommerce/cart',
				'showShipping',
				false,
				'<!-- wp:poocommerce/cart {"showShipping":false} -->',
				true,
			),
			'block_name_case_sensitive'                    => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:PooCommerce/Cart {"displayType":"full"} -->',
				false,
			),
			'paragraph_block_center_align'                 => array(
				'core/paragraph',
				'align',
				'center',
				'<!-- wp:paragraph {"align":"center"} --><p class="test1">Hello</p><!-- /wp:paragraph -->',
				true,
			),
			'paragraph_block_different_align'              => array(
				'core/paragraph',
				'align',
				'center',
				'<!-- wp:paragraph {"align":"left"} --><p>Hello</p><!-- /wp:paragraph -->',
				false,
			),
			'multiple_attributes_target_matches'           => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:poocommerce/cart {"displayType":"full","color":"blue","size":"large"} -->
				<div class="wp-block-poocommerce-cart"></div>
				<!-- /wp:poocommerce/cart -->',
				true,
			),
			'empty_attribute_value'                        => array(
				'poocommerce/cart',
				'displayType',
				'',
				'<!-- wp:poocommerce/cart {"displayType":""} -->
				<div class="wp-block-poocommerce-cart"></div>
				<!-- /wp:poocommerce/cart -->',
				true,
			),
			'nested_block_found'                           => array(
				'poocommerce/cart',
				'displayType',
				'full',
				'<!-- wp:group -->
					<div class="wp-block-group">
						<!-- wp:poocommerce/cart {"displayType":"full"} -->
						<div class="wp-block-poocommerce-cart">Cart content</div>
						<!-- /wp:poocommerce/cart -->
					</div>
				<!-- /wp:group -->',
				true,
			),
		);
	}

	/**
	 * Test has_block_variation with all scenarios using data provider
	 *
	 * @dataProvider hasBlockVariationDataProvider
	 *
	 * @param string $block_id The block name to search for.
	 * @param string $attribute The attribute name to check.
	 * @param mixed  $value The expected value of the attribute.
	 * @param string $content The post content to search within.
	 * @param bool   $expected The expected result.
	 */
	public function test_has_block_variation( $block_id, $attribute, $value, $content, $expected ) {
		$result = CartCheckoutUtils::has_block_variation( $block_id, $attribute, $value, $content );

		$this->assertEquals( $expected, $result );
	}
}
