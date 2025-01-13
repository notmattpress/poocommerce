/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { EllipsisMenu } from '@poocommerce/components';
import { ONBOARDING_STORE_NAME } from '@poocommerce/data';
import { useDispatch } from '@wordpress/data';

export type TaskListMenuProps = {
	id: string;
	hideTaskListText?: string;
};

export const TaskListMenu: React.FC< TaskListMenuProps > = ( {
	id,
	hideTaskListText,
} ) => {
	const { hideTaskList } = useDispatch( ONBOARDING_STORE_NAME );

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
