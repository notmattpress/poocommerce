<?php
/**
 * Mock Platform Fetcher class for testing.
 *
 * @package Automattic\PooCommerce\Tests\Internal\CLI\Migrator\Mocks
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Tests\Internal\CLI\Migrator\Mocks;

use Automattic\PooCommerce\Internal\CLI\Migrator\Interfaces\PlatformFetcherInterface;

/**
 * A mock fetcher class for testing purposes.
 */
class MockPlatformFetcher implements PlatformFetcherInterface {

	/**
	 * {@inheritdoc}
	 *
	 * @param array $args Arguments for fetching.
	 */
	public function fetch_batch( array $args ): array {
		return array(
			'items'       => array(
				(object) array(
					'id'   => 1,
					'name' => 'Test Product 1',
				),
				(object) array(
					'id'   => 2,
					'name' => 'Test Product 2',
				),
			),
			'cursor'      => 'next-cursor',
			'hasNextPage' => true,
		);
	}

	/**
	 * {@inheritdoc}
	 *
	 * @param array $args Arguments for fetching.
	 */
	public function fetch_total_count( array $args ): int {
		return 42;
	}
}
