/**
 * Internal dependencies
 */
import './placeholder.scss';

export type TasksPlaceholderProps = {
	numTasks?: number;
	query: {
		task?: string;
	};
};

export const TasksPlaceholder: React.FC< TasksPlaceholderProps > = ( {
	numTasks = 5,
	query,
} ) => {
	const isSingleTask = Boolean( query.task );

	if ( isSingleTask ) {
		return null;
	}

	return (
		<div className="poocommerce-task-dashboard__container">
			<div
				className="poocommerce-card poocommerce-task-card is-loading"
				aria-hidden
			>
				<div className="poocommerce-card__header">
					<div className="poocommerce-card__title-wrapper">
						<div className="poocommerce-card__title poocommerce-card__header-item">
							<span className="is-placeholder" />
						</div>
					</div>
				</div>
				<div className="poocommerce-card__body">
					<div className="poocommerce-list">
						{ Array.from( new Array( numTasks ) ).map( ( v, i ) => (
							<div
								key={ i }
								className="poocommerce-list__item has-action"
							>
								<div className="poocommerce-list__item-inner">
									<div className="poocommerce-list__item-before">
										<span className="is-placeholder" />
									</div>
									<div className="poocommerce-list__item-text">
										<div className="poocommerce-list__item-title">
											<span className="is-placeholder" />
										</div>
									</div>
									<div className="poocommerce-list__item-after">
										<span className="is-placeholder" />
									</div>
								</div>
							</div>
						) ) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default TasksPlaceholder;
