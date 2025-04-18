<?php

namespace Automattic\PooCommerce\Blueprint\Tests\Unit;

use Automattic\PooCommerce\Blueprint\Tests\TestCase;
use Automattic\PooCommerce\Blueprint\ZipExportedSchema;

/**
 * Class ZipExportedSchemaTest
 */
class ZipExportedSchemaTest extends TestCase {
	/**
	 * Test it throws exception on invalid plugin slug.
	 *
	 * @return void
	 * @throws \Exception If the plugin slug is invalid.
	 */
	public function test_it_throws_invalid_argument_exception_with_invalid_slug() {
		$this->markTestSkipped( "Marking this test as skipped since we no longer use ZipExportedSchema. We'll bring it back once Playground implements it." );
		$this->expectException( \InvalidArgumentException::class );
		// phpcs:ignore
		$json = json_decode( file_get_contents( $this->get_fixture_path( 'install-plugin-with-invalid-slug.json' ) ), true );
		$mock = Mock( ZipExportedSchema::class, array( $json ) );
		$mock->makePartial();
		$mock->shouldAllowMockingProtectedMethods();
		$mock->shouldReceive( 'maybe_create_dir' )->andReturn( null );
		$mock->shouldReceive( 'wp_filesystem_put_contents' )->andReturn( null );
		$mock->zip();
	}
}
