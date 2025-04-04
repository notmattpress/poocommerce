<?php
/**
 * Tests for WC_Test_Admin_Post_Types class.
 *
 * @package PooCommerce\Tests\Util
 */

/**
 * PooCommerce Post Type class.
 */
class WC_Test_Admin_Post_Types extends WC_Unit_Test_Case {

	/**
	 * Instance of WC_Admin_Upload_Downloadable_Product.
	 *
	 * @var \WC_Admin_Upload_Downloadable_Product
	 */
	protected $wc_cpt;


	/**
	 * Setup. Create a instance to use throughout.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->wc_cpt = new WC_Admin_Upload_Downloadable_Product();
	}

	/**
	 * Check if filename is extended and extension is preserved.
	 */
	public function test_unique_filename() {
		$full_filename = 'dummy_filename.csv';
		$ext = '.csv';

		$unique_filename = $this->wc_cpt->unique_filename( $full_filename, $ext );
		$this->assertEquals( strlen( $full_filename ) + 6 + 1, strlen( $unique_filename ) );
		$this->assertEquals( $ext, substr( $unique_filename, -4 ) );
	}

	/**
	 * Check if filename is extended properly when its very long.
	 */
	public function test_unique_filename_for_large_name() {
		$full_filename = str_repeat( 'w', 250 ) . '.csv';
		$ext           = '.csv';
		$unique_filename = $this->wc_cpt->unique_filename( $full_filename, $ext );
		$this->assertEquals( 254, strlen( $unique_filename ) );
		$this->assertEquals( $ext, substr( $unique_filename, - 4 ) );
	}
}
