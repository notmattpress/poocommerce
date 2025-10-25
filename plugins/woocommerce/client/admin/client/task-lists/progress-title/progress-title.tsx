/**
 * External dependencies
 */
import { useSlot } from '@poocommerce/experimental';

/**
 * Internal dependencies
 */
import {
	WC_TASKLIST_EXPERIMENTAL_PROGRESS_TITLE_SLOT_NAME,
	WooTaskListProgressTitleItem,
} from './utils';

import {
	DefaultProgressTitle,
	DefaultProgressTitleProps,
} from './default-progress-title';

export const ProgressTitle = ( { taskListId }: DefaultProgressTitleProps ) => {
	const slot = useSlot( WC_TASKLIST_EXPERIMENTAL_PROGRESS_TITLE_SLOT_NAME );

	return Boolean( slot?.fills?.length ) ? (
		<WooTaskListProgressTitleItem.Slot fillProps={ { taskListId } } />
	) : (
		<DefaultProgressTitle taskListId={ taskListId } />
	);
};
