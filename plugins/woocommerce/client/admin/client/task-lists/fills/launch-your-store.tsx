/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { WooOnboardingTaskListItem } from '@poocommerce/onboarding';

const LaunchYourStoreTaskItem = () => {
	return (
		<WooOnboardingTaskListItem id="launch-your-store">
			{ ( { defaultTaskItem: DefaultTaskItem, isComplete } ) => {
				return <DefaultTaskItem isClickable={ ! isComplete } />;
			} }
		</WooOnboardingTaskListItem>
	);
};

registerPlugin( 'poocommerce-admin-task-launch-your-store', {
	scope: 'poocommerce-tasks',
	render: LaunchYourStoreTaskItem,
} );
