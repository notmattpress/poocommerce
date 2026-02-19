/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { EllipsisMenu } from '@poocommerce/components';
import { onboardingStore } from '@poocommerce/data';
import { useDispatch } from '@wordpress/data';

export type TaskListMenuProps = {
	id: string;
	hideTaskListText?: string;
};

export const TaskListMenu = ( { id, hideTaskListText }: TaskListMenuProps ) => {
	const { hideTaskList } = useDispatch( onboardingStore );

	return (
		<div className="poocommerce-card__menu poocommerce-card__header-item">
			<EllipsisMenu
				label={ __( 'Task List Options', 'poocommerce' ) }
				renderContent={ () => (
					<div className="poocommerce-task-card__section-controls">
						<Button onClick={ () => hideTaskList( id ) }>
							{ hideTaskListText ||
								__( 'Hide this', 'poocommerce' ) }
						</Button>
					</div>
				) }
			/>
		</div>
	);
};
