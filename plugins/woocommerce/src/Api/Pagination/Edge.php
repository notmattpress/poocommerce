<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Api\Pagination;

/**
 * Represents an edge in a Relay-style connection.
 */
class Edge {
	public string $cursor;

	public object $node;
}
