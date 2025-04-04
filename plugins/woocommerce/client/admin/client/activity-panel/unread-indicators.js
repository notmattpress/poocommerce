/**
 * External dependencies
 */
import { notesStore, userStore, QUERY_DEFAULTS } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { getUnreadNotesCount } from '~/inbox-panel/utils';
import { getAdminSetting } from '~/utils/admin-settings';

const UNREAD_NOTES_QUERY = {
	page: 1,
	per_page: QUERY_DEFAULTS.pageSize,
	status: 'unactioned',
	type: QUERY_DEFAULTS.noteTypes,
	orderby: 'date',
	order: 'desc',
};

export function hasUnreadNotes( select ) {
	const { getNotes, getNotesError, isResolving } = select( notesStore );

	const { getCurrentUser } = select( userStore );
	const userData = getCurrentUser();
	const lastRead = parseInt(
		userData &&
			userData.poocommerce_meta &&
			userData.poocommerce_meta.activity_panel_inbox_last_read,
		10
	);

	if ( ! lastRead ) {
		return null;
	}

	getNotes( UNREAD_NOTES_QUERY );
	const isError = Boolean(
		getNotesError( 'getNotes', [ UNREAD_NOTES_QUERY ] )
	);
	const isRequesting = isResolving( 'getNotes', [ UNREAD_NOTES_QUERY ] );

	if ( isError || isRequesting ) {
		return null;
	}

	const latestNotes = getNotes( UNREAD_NOTES_QUERY );
	const unreadNotesCount = getUnreadNotesCount( latestNotes, lastRead );

	return unreadNotesCount > 0;
}

export function getLowStockCount() {
	return getAdminSetting( 'lowStockCount', 0 );
}
