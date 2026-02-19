<?php
/**
 * A provider for getting the current DateTime.
 */

namespace Automattic\PooCommerce\Admin\DateTimeProvider;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Admin\DateTimeProvider\DateTimeProviderInterface;

/**
 * Current DateTime Provider.
 *
 * Uses the current DateTime.
 */
class CurrentDateTimeProvider implements DateTimeProviderInterface {
	/**
	 * Returns the current DateTime.
	 *
	 * @return DateTime
	 */
	public function get_now() {
		return new \DateTime();
	}
}
