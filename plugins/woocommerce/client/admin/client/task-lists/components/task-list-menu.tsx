/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { DropdownMenu } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import { onboardingStore } from '@poocommerce/data';
import { useDispatch } from '@wordpress/data';

export type TaskListMenuProps = {
	id: string;
	hideTaskListText?: string;
};

export const TaskListMenu = ( { id, hideTaskListText }: TaskListMenuProps ) => {
	const { hideTaskList } = useDispatch( onboardingStore );
	const label = __( 'Task list options', 'poocommerce' );

	return (
		<div className="poocommerce-card__menu poocommerce-card__header-item">
			<DropdownMenu
				controls={ [
					{
						title:
							hideTaskListText ||
							__( 'Hide this', 'poocommerce' ),
						onClick: () => hideTaskList( id ),
					},
				] }
				icon={ moreVertical }
				label={ label }
				popoverProps={ { placement: 'bottom-end' } }
				toggleProps={ {
					className: 'poocommerce-ellipsis-menu__toggle',
				} }
			/>
		</div>
	);
};
