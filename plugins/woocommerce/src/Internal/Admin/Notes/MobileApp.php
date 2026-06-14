<?php
/**
 * PooCommerce Admin Mobile App Note Provider.
 *
 * Adds a note to the merchant's inbox showing the benefits of the mobile app.
 */

namespace Automattic\PooCommerce\Internal\Admin\Notes;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Admin\Notes\Note;
use Automattic\PooCommerce\Admin\Notes\NoteTraits;

/**
 * Mobile_App
 */
class MobileApp {
	/**
	 * Note traits.
	 */
	use NoteTraits;

	/**
	 * Name of the note for use in the database.
	 */
	const NOTE_NAME = 'wc-admin-mobile-app';

	/**
	 * Get the note.
	 *
	 * @return Note
	 */
	public static function get_note() {
		// We want to show the mobile app note after day 2.
		$two_days_in_seconds = 2 * DAY_IN_SECONDS;
		if ( ! self::is_wc_admin_active_in_date_range( 'week-1', $two_days_in_seconds ) ) {
			return;
		}

		$content = __( 'Install the PooCommerce mobile app to manage orders, receive sales notifications, and view key metrics — wherever you are.', 'poocommerce' );

		$note = new Note();
		$note->set_title( __( 'Install Woo mobile app', 'poocommerce' ) );
		$note->set_content( $content );
		$note->set_content_data( (object) array() );
		$note->set_type( Note::E_WC_ADMIN_NOTE_INFORMATIONAL );
		$note->set_name( self::NOTE_NAME );
		$note->set_source( 'poocommerce-admin' );
		$note->add_action( 'learn-more', __( 'Learn more', 'poocommerce' ), 'https://poocommerce.com/mobile/?utm_medium=product' );
		return $note;
	}
}
