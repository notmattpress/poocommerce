/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuGroup, MenuItem } from '@wordpress/components';
import { check } from '@wordpress/icons';
import { Fragment } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { onboardingStore, TaskListType, TaskType } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { DisplayOption } from '~/activity-panel/display-options';
import './task-lists.scss';
import {
	SetupTaskList,
	TaskListPlaceholder as SetupTaskListPlaceholder,
} from './setup-task-list';
import './setup-task-list/style.scss';
import { Task } from './components/task';
import { TasksPlaceholder } from './components/placeholder';
import { TaskList } from './components/task-list';
import { getAdminSetting } from '~/utils/admin-settings';

export type TaskListsProps = {
	query: { task?: string };
	context?: string;
};

export const TaskLists = ( { query }: TaskListsProps ) => {
	const { task } = query;
	const { hideTaskList } = useDispatch( onboardingStore );

	const { isResolving, taskLists } = useSelect( ( select ) => {
		return {
			isResolving: ! select( onboardingStore ).hasFinishedResolution(
				'getTaskLists',
				[]
			),
			taskLists: select( onboardingStore ).getTaskLists(),
		};
	}, [] );

	const getCurrentTask = () => {
		if ( ! task ) {
			return null;
		}

		const tasks = taskLists.reduce(
			( acc: TaskType[], taskList: TaskListType ) => [
				...acc,
				...taskList.tasks,
			],
			[]
		);

		const currentTask = tasks.find( ( t: TaskType ) => t.id === task );

		if ( ! currentTask ) {
			return null;
		}

		return currentTask;
	};

	const toggleTaskList = ( taskList: TaskListType ) => {
		const { id, eventPrefix, isHidden } = taskList;
		const newValue = ! isHidden;

		recordEvent(
			newValue ? `${ eventPrefix }hide` : `${ eventPrefix }show`,
			{}
		);

		hideTaskList( id );
	};

	const currentTask = getCurrentTask();

	if ( task && ! currentTask ) {
		return null;
	}

	if ( currentTask ) {
		return (
			<div className="poocommerce-task-dashboard__container">
				<Task query={ query } task={ currentTask } />
			</div>
		);
	}

	const taskListIds = getAdminSetting( 'visibleTaskListIds', [] );
	const TaskListPlaceholderComponent =
		taskListIds[ 0 ] === 'setup'
			? SetupTaskListPlaceholder
			: TasksPlaceholder;

	if ( isResolving ) {
		return <TaskListPlaceholderComponent query={ query } />;
	}

	return (
		<>
			{ taskLists
				.filter( ( { isVisible }: TaskListType ) => isVisible )
				.map( ( taskList: TaskListType ) => {
					const { id, isHidden, isToggleable } = taskList;
					const TaskListComponent =
						id === 'setup' ? SetupTaskList : TaskList;

					return (
						<Fragment key={ id }>
							<TaskListComponent
								isExpandable={ false }
								query={ query }
								{ ...taskList }
							/>
							{ isToggleable && (
								<DisplayOption>
									<MenuGroup
										className="poocommerce-layout__homescreen-display-options"
										label={ __( 'Display', 'poocommerce' ) }
									>
										<MenuItem
											className="poocommerce-layout__homescreen-extension-tasklist-toggle"
											icon={
												isHidden ? undefined : check
											}
											isSelected={ ! isHidden }
											role="menuitemcheckbox"
											onClick={ () =>
												toggleTaskList( taskList )
											}
										>
											{ __(
												'Show things to do next',
												'poocommerce'
											) }
										</MenuItem>
									</MenuGroup>
								</DisplayOption>
							) }
						</Fragment>
					);
				} ) }
		</>
	);
};
