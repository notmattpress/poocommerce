<?php
/**
 * PooCommerce Admin (Dashboard) PooCommerce.com Extension Subscriptions Note Provider.
 *
 * Adds notes to the merchant's inbox concerning PooCommerce.com extension subscriptions.
 */

namespace Automattic\PooCommerce\Internal\Admin\Notes;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Admin\Notes\Note;
use Automattic\PooCommerce\Admin\Notes\Notes;
use Automattic\PooCommerce\Admin\PageController;

/**
 * Woo_Subscriptions_Notes
 */
class WooSubscriptionsNotes {
	const LAST_REFRESH_OPTION_KEY = 'poocommerce_admin-wc-helper-last-refresh';
	const NOTE_NAME               = 'wc-admin-wc-helper-connection';
	const CONNECTION_NOTE_NAME    = 'wc-admin-wc-helper-connection'; // deprecated.
	const SUBSCRIPTION_NOTE_NAME  = 'wc-admin-wc-helper-subscription';
	const NOTIFY_WHEN_DAYS_LEFT   = 60;
	const BUMP_THRESHOLDS         = array( 60, 45, 20, 7, 1 ); // days.

	/**
	 * Hook all the things.
	 */
	public function __construct() {
		add_action( 'admin_head', array( $this, 'admin_head' ) );
		add_action( 'update_option_poocommerce_helper_data', array( $this, 'update_option_poocommerce_helper_data' ), 10, 2 );
	}

	/**
	 * Reacts to changes in the helper option.
	 *
	 * @param array $old_value The previous value of the option.
	 * @param array $value The new value of the option.
	 */
	public function update_option_poocommerce_helper_data( $old_value, $value ) {
		if ( ! is_array( $old_value ) ) {
			$old_value = array();
		}
		if ( ! is_array( $value ) ) {
			$value = array();
		}

		$old_auth  = array_key_exists( 'auth', $old_value ) ? $old_value['auth'] : array();
		$new_auth  = array_key_exists( 'auth', $value ) ? $value['auth'] : array();
		$old_token = array_key_exists( 'access_token', $old_auth ) ? $old_auth['access_token'] : '';
		$new_token = array_key_exists( 'access_token', $new_auth ) ? $new_auth['access_token'] : '';

		// The site just disconnected.
		if ( ! empty( $old_token ) && empty( $new_token ) ) {
			$this->remove_notes();
			return;
		}

		// The site is connected.
		if ( $this->is_connected() ) {
			$this->remove_notes();
			$this->refresh_subscription_notes();
			return;
		}
	}

	/**
	 * Runs on `admin_head` hook. Checks the connection and refreshes subscription notes on relevant pages.
	 */
	public function admin_head() {
		if ( ! PageController::is_admin_or_embed_page() ) {
			// To avoid unnecessarily calling Helper API, we only want to refresh subscription notes,
			// if the request is initiated from the wc admin dashboard or a WC related page which includes
			// the Activity button in WC header.
			return;
		}

		$this->check_connection();

		if ( $this->is_connected() ) {
			$refresh_notes = false;

			// Did the user just do something on the helper page?.
			if ( isset( $_GET['wc-helper-status'] ) ) { // @codingStandardsIgnoreLine.
				$refresh_notes = true;
			}

			// Has it been more than a day since we last checked?
			// Note: We do it this way and not wp_scheduled_task since WC_Helper_Options is not loaded for cron.
			$time_now_gmt = current_time( 'timestamp', 0 );
			$last_refresh = intval( get_option( self::LAST_REFRESH_OPTION_KEY, 0 ) );
			if ( $last_refresh + DAY_IN_SECONDS <= $time_now_gmt ) {
				update_option( self::LAST_REFRESH_OPTION_KEY, $time_now_gmt );
				$refresh_notes = true;
			}

			if ( $refresh_notes ) {
				$this->refresh_subscription_notes();
			}
		}
	}

	/**
	 * Checks the connection. Adds a note (as necessary) if there is no connection.
	 */
	public function check_connection() {
		if ( ! $this->is_connected() ) {
			$data_store = Notes::load_data_store();
			$note_ids   = $data_store->get_notes_with_name( self::CONNECTION_NOTE_NAME );
			if ( ! empty( $note_ids ) ) {
				// We already have a connection note. Exit early.
				return;
			}

			$this->remove_notes();
		}
	}

	/**
	 * Whether or not we think the site is currently connected to PooCommerce.com.
	 *
	 * @return bool
	 */
	public function is_connected() {
		$auth = \WC_Helper_Options::get( 'auth' );
		return ( ! empty( $auth['access_token'] ) );
	}

	/**
	 * Returns the PooCommerce.com provided site ID for this site.
	 *
	 * @return int|false
	 */
	public function get_connected_site_id() {
		if ( ! $this->is_connected() ) {
			return false;
		}

		$auth = \WC_Helper_Options::get( 'auth' );
		return absint( $auth['site_id'] );
	}

	/**
	 * Returns an array of product_ids whose subscriptions are active on this site.
	 *
	 * @return array
	 */
	public function get_subscription_active_product_ids() {
		$site_id = $this->get_connected_site_id();
		if ( ! $site_id ) {
			return array();
		}

		$product_ids = array();

		if ( $this->is_connected() ) {
			try {
				$subscriptions = \WC_Helper::get_subscriptions();
			} catch ( \Exception $e ) {
				$subscriptions = array();
			}

			foreach ( (array) $subscriptions as $subscription ) {
				if ( in_array( $site_id, $subscription['connections'], true ) ) {
					$product_ids[] = $subscription['product_id'];
				}
			}
		}

		return $product_ids;
	}

	/**
	 * Clears all connection or subscription notes.
	 */
	public function remove_notes() {
		Notes::delete_notes_with_name( self::CONNECTION_NOTE_NAME );
		Notes::delete_notes_with_name( self::SUBSCRIPTION_NOTE_NAME );
	}

	/**
	 * Gets the product_id (if any) associated with a note.
	 *
	 * @param Note $note The note object to interrogate.
	 * @return int|false
	 */
	public function get_product_id_from_subscription_note( &$note ) {
		if ( ! is_object( $note ) ) {
			return false;
		}
		$content_data = $note->get_content_data();

		if ( property_exists( $content_data, 'product_id' ) ) {
			return intval( $content_data->product_id );
		}

		return false;
	}

	/**
	 * Removes notes for product_ids no longer active on this site.
	 */
	public function prune_inactive_subscription_notes() {
		$active_product_ids = $this->get_subscription_active_product_ids();

		$data_store = Notes::load_data_store();
		$note_ids   = $data_store->get_notes_with_name( self::SUBSCRIPTION_NOTE_NAME );

		foreach ( (array) $note_ids as $note_id ) {
			$note       = Notes::get_note( $note_id );
			$product_id = $this->get_product_id_from_subscription_note( $note );
			if ( ! empty( $product_id ) ) {
				if ( ! in_array( $product_id, $active_product_ids, true ) ) {
					$note->delete();
				}
			}
		}
	}

	/**
	 * Finds a note for a given product ID, if the note exists at all.
	 *
	 * @param int $product_id The product ID to search for.
	 * @return Note|false
	 */
	public function find_note_for_product_id( $product_id ) {
		$product_id = intval( $product_id );

		$data_store = Notes::load_data_store();
		$note_ids   = $data_store->get_notes_with_name( self::SUBSCRIPTION_NOTE_NAME );
		foreach ( (array) $note_ids as $note_id ) {
			$note             = Notes::get_note( $note_id );
			$found_product_id = $this->get_product_id_from_subscription_note( $note );

			if ( $product_id === $found_product_id ) {
				return $note;
			}
		}

		return false;
	}

	/**
	 * Deletes a note for a given product ID, if the note exists at all.
	 *
	 * @param int $product_id The product ID to search for.
	 */
	public function delete_any_note_for_product_id( $product_id ) {
		$product_id = intval( $product_id );

		$note = $this->find_note_for_product_id( $product_id );
		if ( $note ) {
			$note->delete();
		}
	}

	/**
	 * Adds or updates a note for an expiring subscription.
	 *
	 * @param array $subscription The subscription to work with.
	 */
	public function add_or_update_subscription_expiring( $subscription ) {
		$product_id            = $subscription['product_id'];
		$product_name          = $subscription['product_name'];
		$expires               = intval( $subscription['expires'] );
		$time_now_gmt          = current_time( 'timestamp', 0 );
		$days_until_expiration = intval( ceil( ( $expires - $time_now_gmt ) / DAY_IN_SECONDS ) );

		$note = $this->find_note_for_product_id( $product_id );

		// Note: There is no reason this property should not exist. This is just defensive programming.
		if ( $note && property_exists( $note->get_content_data(), 'days_until_expiration' ) ) {
			$note_days_until_expiration = intval( $note->get_content_data()->days_until_expiration );
			if ( $days_until_expiration === $note_days_until_expiration ) {
				// Note is already up to date. Bail.
				return;
			}

			// If we have a note and we are at or have crossed a threshold, we should delete
			// the old note and create a new one, thereby "bumping" the note to the top of the inbox.
			foreach ( (array) self::BUMP_THRESHOLDS as $bump_threshold ) {
				if ( ( $note_days_until_expiration > $bump_threshold ) && ( $days_until_expiration <= $bump_threshold ) ) {
					$note->delete();
					$note = false;
					break;
				}
			}
		}

		$note_title = sprintf(
			/* translators: name of the extension subscription expiring soon */
			__( '%s subscription expiring soon', 'poocommerce' ),
			$product_name
		);

		$note_content = sprintf(
			/* translators: number of days until the subscription expires */
			__( 'Your subscription expires in %d days. Enable autorenew to avoid losing updates and access to support.', 'poocommerce' ),
			$days_until_expiration
		);

		$note_content_data = (object) array(
			'product_id'            => $product_id,
			'product_name'          => $product_name,
			'expired'               => false,
			'days_until_expiration' => $days_until_expiration,
		);

		if ( ! $note ) {
			$note = new Note();
		}

		// Reset everything in case we are repurposing an expired note as an expiring note.
		$note->set_title( $note_title );
		$note->set_type( Note::E_WC_ADMIN_NOTE_WARNING );
		$note->set_name( self::SUBSCRIPTION_NOTE_NAME );
		$note->set_source( 'poocommerce-admin' );
		$note->clear_actions();
		$note->add_action(
			'enable-autorenew',
			__( 'Enable Autorenew', 'poocommerce' ),
			'https://poocommerce.com/my-account/my-subscriptions/?utm_medium=product'
		);
		$note->set_content( $note_content );
		$note->set_content_data( $note_content_data );
		$note->save();
	}

	/**
	 * Adds a note for an expired subscription, or updates an expiring note to expired.
	 *
	 * @param array $subscription The subscription to work with.
	 */
	public function add_or_update_subscription_expired( $subscription ) {
		$product_id   = $subscription['product_id'];
		$product_name = $subscription['product_name'];
		$product_page = $subscription['product_url'];
		$expires      = intval( $subscription['expires'] );
		$expires_date = gmdate( 'F jS', $expires );

		$note = $this->find_note_for_product_id( $product_id );
		if ( $note ) {
			$note_content_data = $note->get_content_data();
			if ( $note_content_data->expired ) {
				// We've already got a full fledged expired note for this. Bail.
				// Expired notes' content don't change with time.
				return;
			}
		}

		$note_title = sprintf(
			/* translators: name of the extension subscription that expired */
			__( '%s subscription expired', 'poocommerce' ),
			$product_name
		);

		$note_content = sprintf(
			/* translators: date the subscription expired, e.g. Jun 7th 2018 */
			__( 'Your subscription expired on %s. Get a new subscription to continue receiving updates and access to support.', 'poocommerce' ),
			$expires_date
		);

		$note_content_data = (object) array(
			'product_id'   => $product_id,
			'product_name' => $product_name,
			'expired'      => true,
			'expires'      => $expires,
			'expires_date' => $expires_date,
		);

		if ( ! $note ) {
			$note = new Note();
		}

		$note->set_title( $note_title );
		$note->set_content( $note_content );
		$note->set_content_data( $note_content_data );
		$note->set_type( Note::E_WC_ADMIN_NOTE_WARNING );
		$note->set_name( self::SUBSCRIPTION_NOTE_NAME );
		$note->set_source( 'poocommerce-admin' );
		$note->clear_actions();
		$note->add_action(
			'renew-subscription',
			__( 'Renew Subscription', 'poocommerce' ),
			$product_page
		);
		$note->save();
	}

	/**
	 * For each active subscription on this site, checks the expiration date and creates/updates/deletes notes.
	 */
	public function refresh_subscription_notes() {
		if ( ! $this->is_connected() ) {
			return;
		}

		$this->prune_inactive_subscription_notes();

		try {
			$subscriptions = \WC_Helper::get_subscriptions();
		} catch ( \Exception $e ) {
			$subscriptions = array();
		}
		$active_product_ids = $this->get_subscription_active_product_ids();

		foreach ( (array) $subscriptions as $subscription ) {
			// Only concern ourselves with active products.
			$product_id = $subscription['product_id'];
			if ( ! in_array( $product_id, $active_product_ids, true ) ) {
				continue;
			}

			// If the subscription will auto-renew, clean up and exit.
			if ( $subscription['autorenew'] ) {
				$this->delete_any_note_for_product_id( $product_id );
				continue;
			}

			// If the subscription is not expiring by the first threshold, clean up and exit.
			$first_threshold = DAY_IN_SECONDS * self::BUMP_THRESHOLDS[0];
			$expires         = intval( $subscription['expires'] );
			$time_now_gmt    = current_time( 'timestamp', 0 );
			if ( $expires > $time_now_gmt + $first_threshold ) {
				$this->delete_any_note_for_product_id( $product_id );
				continue;
			}

			// Otherwise, if the subscription can still have auto-renew enabled, let them know that now.
			if ( $expires > $time_now_gmt ) {
				$this->add_or_update_subscription_expiring( $subscription );
				continue;
			}

			// If we got this far, the subscription has completely expired, let them know.
			$this->add_or_update_subscription_expired( $subscription );
		}
	}
}
