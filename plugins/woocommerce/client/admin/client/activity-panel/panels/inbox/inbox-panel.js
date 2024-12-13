/**
 * Internal dependencies
 */
import './inbox.scss';
import NotesPanel from '~/inbox-panel';
import { AbbreviatedNotificationsPanel } from './abbreviated-notifications-panel';

export const InboxPanel = ( {
	hasAbbreviatedNotifications,
	thingsToDoNextCount,
} ) => {
	return (
		<div className="poocommerce-notification-panels">
			{ hasAbbreviatedNotifications && (
				<AbbreviatedNotificationsPanel
					thingsToDoNextCount={ thingsToDoNextCount }
				/>
			) }
			<NotesPanel showHeader={ false } />
		</div>
	);
};

export default InboxPanel;
