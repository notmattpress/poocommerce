/**
 * External dependencies
 */
import {
	WooHeaderNavigationItem,
	WooHeaderPageTitle,
} from '@poocommerce/admin-layout';
import { WooOnboardingTask } from '@poocommerce/onboarding';
import { getHistory, getNewPath } from '@poocommerce/navigation';
import { onboardingStore, TaskType } from '@poocommerce/data';
import { useCallback } from '@wordpress/element';
import { useDispatch, resolveSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { BackButton } from './back-button';

export type TaskProps = {
	query: { task?: string };
	task: TaskType;
};

export const Task = ( { query, task }: TaskProps ) => {
	const id = query.task || '';
	if ( ! id ) {
		// eslint-disable-next-line no-console
		console.warn( 'No task id provided' );
		// eslint-enable-next-line no-console
	}

	const { invalidateResolutionForStoreSelector, optimisticallyCompleteTask } =
		useDispatch( onboardingStore );

	const updateBadge = useCallback( async () => {
		const badgeElements = document.querySelectorAll(
			'#adminmenu .poocommerce-task-list-remaining-tasks-badge'
		);

		if ( ! badgeElements?.length ) {
			return;
		}

		const setupTaskList = await resolveSelect(
			onboardingStore
		).getTaskList( 'setup' );
		if ( ! setupTaskList ) {
			return;
		}

		const remainingTasksCount = setupTaskList.tasks.filter(
			( _task: TaskType ) => ! _task.isComplete
		).length;

		badgeElements.forEach( ( badge ) => {
			badge.textContent = remainingTasksCount.toString();
		} );
	}, [] );

	const onComplete = useCallback(
		( options: Record< string, unknown > ) => {
			optimisticallyCompleteTask( id );
			getHistory().push(
				options && options.redirectPath
					? options.redirectPath
					: getNewPath( {}, '/', {} )
			);
			invalidateResolutionForStoreSelector( 'getTaskLists' );
			updateBadge();
		},
		[
			id,
			invalidateResolutionForStoreSelector,
			optimisticallyCompleteTask,
			updateBadge,
		]
	);

	return (
		<>
			<WooHeaderNavigationItem>
				<BackButton title={ task.title } />
			</WooHeaderNavigationItem>
			<WooHeaderPageTitle>{ task.title }</WooHeaderPageTitle>
			<WooOnboardingTask.Slot
				id={ id }
				fillProps={ { onComplete, query, task } }
			/>
		</>
	);
};
