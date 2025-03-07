<?php
/**
 * PooCommerce Activity Panel.
 */

namespace Automattic\PooCommerce\Internal\Admin;

use Automattic\PooCommerce\Admin\Notes\Notes;

/**
 * Contains backend logic for the activity panel feature.
 */
class ActivityPanels {
	/**
	 * Class instance.
	 *
	 * @var ActivityPanels instance
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
		add_filter( 'poocommerce_admin_get_user_data_fields', array( $this, 'add_user_data_fields' ) );
		// Run after Automattic\PooCommerce\Internal\Admin\Loader.
		add_filter( 'poocommerce_components_settings', array( $this, 'component_settings' ), 20 );
		// New settings injection.
		add_filter( 'poocommerce_admin_shared_settings', array( $this, 'component_settings' ), 20 );
	}

	/**
	 * Adds fields so that we can store activity panel last read and open times.
	 *
	 * @param array $user_data_fields User data fields.
	 * @return array
	 */
	public function add_user_data_fields( $user_data_fields ) {
		return array_merge(
			$user_data_fields,
			array(
				'activity_panel_inbox_last_read',
				'activity_panel_reviews_last_read',
			)
		);
	}

	/**
	 * Add alert count to the component settings.
	 *
	 * @param array $settings Component settings.
	 */
	public function component_settings( $settings ) {
		$settings['alertCount'] = Notes::get_notes_count( array( 'error', 'update' ), array( 'unactioned' ) );
		return $settings;
	}
}
