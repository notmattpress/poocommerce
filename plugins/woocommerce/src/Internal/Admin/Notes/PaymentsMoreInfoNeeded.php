<?php
/**
 * PooCommerce Admin Payments More Info Needed Inbox Note Provider
 */

namespace Automattic\PooCommerce\Internal\Admin\Notes;

use Automattic\PooCommerce\Admin\Notes\Note;
use Automattic\PooCommerce\Admin\Notes\NoteTraits;
use Automattic\PooCommerce\Internal\Admin\WcPayWelcomePage;

defined( 'ABSPATH' ) || exit;

/**
 * PaymentsMoreInfoNeeded
 */
class PaymentsMoreInfoNeeded {
	/**
	 * Note traits.
	 */
	use NoteTraits;

	/**
	 * Name of the note for use in the database.
	 */
	const NOTE_NAME = 'wc-admin-payments-more-info-needed';

	/**
	 * Should this note exist?
	 */
	public static function is_applicable() {
		return self::should_display_note();
	}

	/**
	 * Returns true if we should display the note.
	 *
	 * @return bool
	 */
	public static function should_display_note() {
		// A WooPayments incentive must not be visible.
		if ( WcPayWelcomePage::instance()->has_incentive() ) {
			return false;
		}

		// More than 30 days since viewing the welcome page.
		$exit_survey_timestamp = get_option( 'wcpay_welcome_page_exit_survey_more_info_needed_timestamp', false );
		if ( ! $exit_survey_timestamp ||
			( time() - $exit_survey_timestamp < 30 * DAY_IN_SECONDS )
		) {
			return false;
		}

		return true;
	}

	/**
	 * Get the note.
	 *
	 * @return Note
	 */
	public static function get_note() {
		if ( ! self::should_display_note() ) {
			return;
		}
		$content = __( 'We recently asked you if you wanted more information about WooPayments. Run your business and manage your payments in one place with the solution built and supported by PooCommerce.', 'poocommerce' );

		$note = new Note();
		$note->set_title( __( 'Payments made simple with WooPayments', 'poocommerce' ) );
		$note->set_content( $content );
		$note->set_content_data( (object) array() );
		$note->set_type( Note::E_WC_ADMIN_NOTE_INFORMATIONAL );
		$note->set_name( self::NOTE_NAME );
		$note->set_source( 'poocommerce-admin' );
		$note->add_action( 'learn-more', __( 'Learn more here', 'poocommerce' ), 'https://poocommerce.com/payments/' );
		return $note;
	}
}
