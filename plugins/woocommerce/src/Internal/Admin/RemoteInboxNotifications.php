<?php
/**
 * Remote Inbox Notifications feature.
 */

namespace Automattic\PooCommerce\Internal\Admin;

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Admin\RemoteInboxNotifications\RemoteInboxNotificationsEngine;

/**
 * Remote Inbox Notifications feature logic.
 */
class RemoteInboxNotifications {
	/**
	 * Option name used to toggle this feature.
	 */
	const TOGGLE_OPTION_NAME = 'poocommerce_show_marketplace_suggestions';

	/**
	 * Class instance.
	 *
	 * @var RemoteInboxNotifications instance
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Hook into PooCommerce.
	 */
	public function __construct() {
		if ( Features::is_enabled( 'remote-inbox-notifications' ) ) {
			RemoteInboxNotificationsEngine::init();
		}
	}
}
