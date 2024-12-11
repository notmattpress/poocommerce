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
}
