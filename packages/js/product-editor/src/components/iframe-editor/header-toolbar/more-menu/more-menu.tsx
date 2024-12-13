/**
 * External dependencies
 */
import { MenuGroup } from '@wordpress/components';
import { createElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isWpVersion } from '@poocommerce/settings';
// eslint-disable-next-line @poocommerce/dependency-group
import {
	ActionItem,
	MoreMenuDropdown,
	// @ts-expect-error No types for this exist yet.
} from '@wordpress/interface';

/**
 * Internal dependencies
 */
import { ToolsMenuGroup } from './tools-menu-group';
import { WritingMenu } from '../writing-menu';
import { getGutenbergVersion } from '../../../../utils/get-gutenberg-version';
import { MORE_MENU_ACTION_ITEM_SLOT_NAME } from '../../constants';

export const MoreMenu = () => {
	const renderBlockToolbar =
		isWpVersion( '6.5', '>=' ) || getGutenbergVersion() > 17.3;

	return (
		<MoreMenuDropdown>
			{ ( { onClose }: { onClose: () => void } ) => (
				<>
					{ renderBlockToolbar && <WritingMenu /> }

					<ActionItem.Slot
						name={ MORE_MENU_ACTION_ITEM_SLOT_NAME }
						label={ __( 'Plugins', 'poocommerce' ) }
						as={ MenuGroup }
						fillProps={ { onClick: onClose } }
					/>

					<ToolsMenuGroup />
				</>
			) }
		</MoreMenuDropdown>
	);
};
