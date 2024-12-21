/* eslint-disable @wordpress/i18n-text-domain */
/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '@wordpress/components';
import { ONBOARDING_STORE_NAME } from '@poocommerce/data';
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch } from '@wordpress/data';
import {
	WooOnboardingTask,
	WooOnboardingTaskListItem,
} from '@poocommerce/onboarding';

const Task = ( { onComplete, task } ) => {
	const { actionTask } = useDispatch( ONBOARDING_STORE_NAME );
	const { isActioned } = task;

	return (
		<Card className="poocommerce-task-card">
			<CardBody>
				{ __(
					"This task's completion status is dependent on being actioned. The action button below will action this task, while the complete button will optimistically complete the task in the task list and redirect back to the task list. Note that in this example, the task must be actioned for completion to persist.",
					'plugin-domain'
				) }{ ' ' }
				<br />
				<br />
				{ __( 'Task actioned status: ', 'plugin-domain' ) }{ ' ' }
				{ isActioned ? 'actioned' : 'not actioned' }
				<br />
				<br />
				<div>
					<button
						onClick={ () => {
							actionTask( 'my-task' );
						} }
					>
						{ __( 'Action task', 'plugin-domain' ) }
					</button>
					<button onClick={ onComplete }>
						{ __( 'Complete', 'plugin-domain' ) }
					</button>
				</div>
			</CardBody>
		</Card>
	);
};

registerPlugin( 'add-task-content', {
	render: () => (
		<WooOnboardingTask id="my-task">
			{ ( {
				onComplete,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				query,
				task,
			} ) => <Task onComplete={ onComplete } task={ task } /> }
		</WooOnboardingTask>
	),
	scope: 'poocommerce-tasks',
} );

registerPlugin( 'my-task-list-item-plugin', {
	scope: 'poocommerce-tasks',
	render: () => (
		<WooOnboardingTaskListItem id="my-task">
			{ ( { defaultTaskItem: DefaultTaskItem } ) => (
				// Add a custom wrapper around the default task item.
				<div
					className="poocommerce-custom-tasklist-item"
					style={ {
						border: '1px solid red',
					} }
				>
					<DefaultTaskItem />
				</div>
			) }
		</WooOnboardingTaskListItem>
	),
} );
