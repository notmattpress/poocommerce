<?php
/**
 * PooCommerce Admin Full Refund Fix Data Tool Notice Provider.
 *
 * Adds a note to the merchant's inbox pointing to the full refund fix tool on
 * the PooCommerce > Status > Tools page.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Admin\Notes;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Admin\Notes\Note;
use Automattic\PooCommerce\Admin\Notes\NoteTraits;
use Automattic\PooCommerce\Utilities\FeaturesUtil;
use Automattic\PooCommerce\Utilities\OrderUtil;

/**
 * FullRefundFixDataToolNotice
 *
 * @internal
 * @since 11.2.0
 */
class FullRefundFixDataToolNotice {
	/**
	 * Note traits.
	 */
	use NoteTraits;

	/**
	 * Name of the note for use in the database.
	 */
	const NOTE_NAME = 'wc-admin-full-refund-fix-data-tool';

	/**
	 * Should this note exist?
	 *
	 * @return bool
	 */
	public static function is_applicable() {
		if ( ! FeaturesUtil::feature_is_enabled( 'analytics' ) ) {
			return false;
		}

		// The notice follows the underlying data state, not the tool-row
		// visibility flag (`poocommerce_analytics_show_old_refund_data_tool`),
		// so it auto-hides once the fix has been applied.
		return ! OrderUtil::uses_new_full_refund_data();
	}

	/**
	 * Get the note.
	 *
	 * @return Note|null
	 */
	public static function get_note() {
		if ( ! self::is_applicable() ) {
			return null;
		}

		$note = new Note();

		$note->set_title( __( 'Fix your refund data in Analytics', 'poocommerce' ) );
		$note->set_content(
			__( 'We found some refunded orders where the full refund amount was not recorded correctly in your Analytics reports. Use the full refund fix tool on the Status page to re-import the affected data.', 'poocommerce' )
		);
		$note->set_content_data( (object) array() );
		$note->set_type( Note::E_WC_ADMIN_NOTE_WARNING );
		$note->set_name( self::NOTE_NAME );
		$note->set_source( 'poocommerce-admin' );

		$note->add_action(
			'full-refund-fix-data-tool_view',
			__( 'Fix refund data', 'poocommerce' ),
			admin_url( 'admin.php?page=wc-status&tab=tools' ),
			Note::E_WC_ADMIN_NOTE_UNACTIONED,
			true
		);

		return $note;
	}
}
