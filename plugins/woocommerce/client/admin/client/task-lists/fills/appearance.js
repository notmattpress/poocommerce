/**
 * External dependencies
 */
import { WooOnboardingTaskListItem } from '@poocommerce/onboarding';
import { registerPlugin } from '@wordpress/plugins';
import { getAdminLink } from '@poocommerce/settings';

export const useAppearanceClick = () => {
	const onClick = () => {
		window.location = getAdminLink(
			'theme-install.php?browse=block-themes'
		);
	};

	return { onClick };
};

const AppearanceFill = () => {
	const { onClick } = useAppearanceClick();
	return (
		<WooOnboardingTaskListItem id="appearance">
			{ ( { defaultTaskItem: DefaultTaskItem } ) => (
				<DefaultTaskItem
					// Override task click so it doesn't navigate to a task component.
					onClick={ onClick }
				/>
			) }
		</WooOnboardingTaskListItem>
	);
};

registerPlugin( 'wc-admin-onboarding-task-appearance', {
	scope: 'poocommerce-tasks',
	render: () => <AppearanceFill />,
} );
