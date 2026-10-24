<?php
/**
 * PooCommerce Admin Unsecured Files Note.
 *
 * Adds a warning about potentially unsecured files.
 */

namespace Automattic\PooCommerce\Internal\Admin\Notes;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Admin\Notes\Note;

if ( ! class_exists( Note::class ) ) {
	class_alias( WC_Admin_Note::class, Note::class );
}

/**
 * Unsecured_Report_Files
 */
class UnsecuredReportFiles {

	/**
	 * Name of the note for use in the database.
	 */
	const NOTE_NAME = 'wc-admin-remove-unsecured-report-files';

	/**
	 * Get the note.
	 *
	 * @return Note|null
	 */
	public static function get_note() {
		$note = new Note();
		$note->set_title( __( 'Potentially unsecured files were found in your uploads directory', 'poocommerce' ) );
		$note->set_content(
			sprintf(
				/* translators: 1: opening analytics docs link tag. 2: closing link tag */
				__( 'Files that may contain %1$sstore analytics%2$s reports were found in your uploads directory - we recommend assessing and deleting any such files.', 'poocommerce' ),
				'<a href="https://poocommerce.com/document/poocommerce-analytics/" target="_blank">',
				'</a>'
			)
		);
		$note->set_content_data( (object) array() );
		$note->set_type( Note::E_WC_ADMIN_NOTE_ERROR );
		$note->set_name( self::NOTE_NAME );
		$note->set_source( 'poocommerce-admin' );
		$note->add_action(
			'learn-more',
			__( 'Learn more', 'poocommerce' ),
			'https://developer.poocommerce.com/2021/09/22/important-security-patch-released-in-poocommerce/',
			Note::E_WC_ADMIN_NOTE_UNACTIONED,
			true
		);
		$note->add_action(
			'dismiss',
			__( 'Dismiss', 'poocommerce' ),
			wc_admin_url(),
			Note::E_WC_ADMIN_NOTE_ACTIONED,
			false
		);

		return $note;
	}

	/**
	 * Add the note if it passes predefined conditions.
	 */
	public static function possibly_add_note() {
		$note = self::get_note();

		if ( self::note_exists() ) {
			return;
		}

		$note->save();
	}

	/**
	 * Check if the note has been previously added.
	 */
	public static function note_exists() {
		$data_store = \WC_Data_Store::load( 'admin-note' );
		$note_ids   = $data_store->get_notes_with_name( self::NOTE_NAME );
		return ! empty( $note_ids );
	}

}
