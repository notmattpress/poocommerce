<?php
namespace Automattic\PooCommerce\Blocks;

use Automattic\PooCommerce\Admin\Notes\Note;
use Automattic\PooCommerce\Admin\Notes\Notes;

/**
 * A class used to display inbox messages to merchants in the PooCommerce Admin dashboard.
 *
 * @package Automattic\PooCommerce\Blocks
 * @since x.x.x
 */
class InboxNotifications {

	const SURFACE_CART_CHECKOUT_NOTE_NAME = 'surface_cart_checkout';

	/**
	 * Deletes the note.
	 */
	public static function delete_surface_cart_checkout_blocks_notification() {
		Notes::delete_notes_with_name( self::SURFACE_CART_CHECKOUT_NOTE_NAME );
	}
}
