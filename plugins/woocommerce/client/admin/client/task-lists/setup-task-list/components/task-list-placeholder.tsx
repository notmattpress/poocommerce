/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * Internal dependencies
 */

type TasksPlaceholderProps = {
	numTasks?: number;
	twoColumns?: boolean;
	query: {
		task?: string;
	};
};

export const TaskListPlaceholder: React.FC< TasksPlaceholderProps > = (
	props
) => {
	const { numTasks = 5 } = props;

	return (
		<div
			className={ clsx(
				'poocommerce-task-dashboard__container setup-task-list'
			) }
		>
			<div className="components-card is-size-large poocommerce-task-card poocommerce-homescreen-card is-loading">
				<div className="components-card__header is-size-medium">
					<div className="poocommerce-task-card__header">
						<div className="is-placeholder"> </div>
					</div>
				</div>
				<ul className="poocommerce-experimental-list">
					{ Array.from( new Array( numTasks ) ).map( ( v, i ) => (
						<li
							tabIndex={ i }
							key={ i }
							className="poocommerce-experimental-list__item poocommerce-task-list__item"
						>
							<div className="poocommerce-task-list__item-before">
								<div className="is-placeholder"></div>
							</div>
							<div className="poocommerce-task-list__item-text">
								<div className="components-truncate components-text is-placeholder"></div>
							</div>
						</li>
					) ) }
				</ul>
			</div>
		</div>
	);
};

export default TaskListPlaceholder;
