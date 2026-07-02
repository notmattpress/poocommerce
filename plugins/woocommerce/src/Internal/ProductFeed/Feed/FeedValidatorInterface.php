<?php
/**
 * Feed Validator Interface.
 *
 * @package Automattic\PooCommerce\Internal\ProductFeed
 */

declare(strict_types=1);

namespace Automattic\PooCommerce\Internal\ProductFeed\Feed;

/**
 * Feed Validator Interface.
 *
 * @since 10.5.0
 */
interface FeedValidatorInterface {
	/**
	 * Validate a single entry.
	 *
	 * @param array       $row     The entry to validate.
	 * @param \WC_Product $product The related product. Will be updated with validation status.
	 * @return string[]            Validation issues.
	 */
	public function validate_entry( array $row, \WC_Product $product ): array;
}
