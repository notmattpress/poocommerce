<?php

defined( 'ABSPATH' ) || exit;

register_poocommerce_admin_test_helper_rest_route(
	'/admin-notes/delete-all-notes/v1',
	'admin_notes_delete_all_notes'
);

/**
 * Deletes all admin notes.
 */
function admin_notes_delete_all_notes() {
	global $wpdb;

	$deleted_note_count   = $wpdb->query( "DELETE FROM {$wpdb->prefix}wc_admin_notes" );
	$deleted_action_count = $wpdb->query( "DELETE FROM {$wpdb->prefix}wc_admin_note_actions" );

	return array(
		'deleted_note_count'   => $deleted_note_count,
		'deleted_action_count' => $deleted_action_count,
	);
}

