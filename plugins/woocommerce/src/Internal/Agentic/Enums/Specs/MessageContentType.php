<?php
declare(strict_types=1);
namespace Automattic\PooCommerce\Internal\Agentic\Enums\Specs;

/**
 * Content types for messages as defined in the Agentic Commerce Protocol.
 */
class MessageContentType {
	/**
	 * Plain text content.
	 */
	const PLAIN = 'plain';

	/**
	 * Markdown formatted content.
	 */
	const MARKDOWN = 'markdown';
}
