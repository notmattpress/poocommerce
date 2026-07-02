<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\StoreApi\Schemas\V1;

use Automattic\PooCommerce\StoreApi\Schemas\V1\CheckoutSchema;
use Automattic\PooCommerce\StoreApi\Schemas\ExtendSchema;
use Automattic\PooCommerce\StoreApi\SchemaController;
use Automattic\PooCommerce\StoreApi\Formatters;
use Automattic\PooCommerce\StoreApi\Formatters\MoneyFormatter;
use Automattic\PooCommerce\StoreApi\Formatters\HtmlFormatter;
use Automattic\PooCommerce\StoreApi\Formatters\CurrencyFormatter;
use WC_Unit_Test_Case;

/**
 * Tests that CheckoutSchema::sanitize_additional_fields() does not strip
 * backslashes from additional checkout field values.
 *
 * Additional fields are read from the same JSON request body as the address
 * fields, so json_decode() (never magic-quoted) delivers them already
 * unslashed. Calling wp_unslash() on that data silently drops real
 * backslashes the user typed (e.g. "apt 4\").
 *
 * @see https://github.com/poocommerce/poocommerce/issues/58214
 * @see https://github.com/poocommerce/poocommerce/pull/65643#pullrequestreview-4485832478
 */
class CheckoutSchemaTest extends WC_Unit_Test_Case {

	/**
	 * The System Under Test.
	 *
	 * @var CheckoutSchema
	 */
	private $sut;

	/**
	 * The id of the additional text field registered for these tests.
	 *
	 * @var string
	 */
	private $field_id = 'plugin-namespace/gov-id';

	/**
	 * Set up before test.
	 */
	public function setUp(): void {
		parent::setUp();

		add_filter( 'doing_it_wrong_trigger_error', '__return_false' );

		poocommerce_register_additional_checkout_field(
			array(
				'id'       => $this->field_id,
				'label'    => 'Government ID',
				'location' => 'contact',
				'type'     => 'text',
				'required' => false,
			)
		);

		$formatters = new Formatters();
		$formatters->register( 'money', MoneyFormatter::class );
		$formatters->register( 'html', HtmlFormatter::class );
		$formatters->register( 'currency', CurrencyFormatter::class );

		$extend            = new ExtendSchema( $formatters );
		$schema_controller = new SchemaController( $extend );
		$this->sut         = $schema_controller->get( CheckoutSchema::IDENTIFIER );
	}

	/**
	 * Tear down after test.
	 */
	public function tearDown(): void {
		__internal_poocommerce_blocks_deregister_checkout_field( $this->field_id );
		remove_filter( 'doing_it_wrong_trigger_error', '__return_false' );

		parent::tearDown();
	}

	/**
	 * @testdox Should preserve a trailing backslash in an additional text field.
	 */
	public function test_preserves_trailing_backslash_in_additional_field(): void {
		$result = $this->sut->sanitize_additional_fields( array( $this->field_id => 'apt 4\\' ) );

		$this->assertSame(
			'apt 4\\',
			$result[ $this->field_id ],
			'A trailing backslash should not be stripped from an additional checkout field.'
		);
	}

	/**
	 * @testdox Should preserve a mid-string backslash in an additional text field.
	 */
	public function test_preserves_mid_string_backslash_in_additional_field(): void {
		$result = $this->sut->sanitize_additional_fields( array( $this->field_id => 'a\\b' ) );

		$this->assertSame(
			'a\\b',
			$result[ $this->field_id ],
			'A mid-string backslash should not be stripped from an additional checkout field.'
		);
	}

	/**
	 * @testdox Should not corrupt a backslash-free additional text field.
	 */
	public function test_does_not_corrupt_backslash_free_additional_field(): void {
		$result = $this->sut->sanitize_additional_fields( array( $this->field_id => 'AB12345' ) );

		$this->assertSame(
			'AB12345',
			$result[ $this->field_id ],
			'A plain additional checkout field should be unchanged.'
		);
	}
}
