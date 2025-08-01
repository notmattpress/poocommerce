/**
 * External dependencies
 */
import { EllipsisMenu } from '@poocommerce/components';
import { PaymentsProvider } from '@poocommerce/data';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { EllipsisMenuContent } from '~/settings-payments/components/ellipsis-menu-content';
import { isWooPayments } from '~/settings-payments/utils';
import { WooPaymentsResetAccountModal } from '~/settings-payments/components/modals';

interface EllipsisMenuProps {
	/**
	 * The label for the ellipsis menu.
	 */
	label: string;
	/**
	 * The payments provider associated with the menu.
	 */
	provider: PaymentsProvider;
}

/**
 * A wrapper component for rendering an ellipsis menu with dynamic content based on the provided payment provider.
 * This component determines whether the provider supports specific actions, such as resetting accounts and displays appropriate menu content.
 */
export const EllipsisMenuWrapper = ( {
	provider,
	label,
}: EllipsisMenuProps ) => {
	const [ resetAccountModalVisible, setResetAccountModalVisible ] =
		useState( false );

	// For WooPayments, we can reset a connected account if either:
	// - the account is a test-drive/sandbox account - this can be reset at any time.
	// - the account is a live account that has not completed onboarding.
	const canResetAccount =
		isWooPayments( provider.id ) &&
		provider._type === 'gateway' &&
		provider.state?.account_connected &&
		( provider.onboarding?.state?.test_mode ||
			! provider.onboarding?.state?.completed );

	return (
		<>
			<EllipsisMenu
				label={ label }
				renderContent={ ( { onToggle } ) => (
					<EllipsisMenuContent
						provider={ provider }
						pluginFile={ provider.plugin.file }
						isSuggestion={ provider._type === 'suggestion' }
						links={ provider.links }
						onToggle={ onToggle }
						isEnabled={ provider.state?.enabled }
						canResetAccount={ canResetAccount }
						setResetAccountModalVisible={
							setResetAccountModalVisible
						}
					/>
				) }
				focusOnMount={ true }
			/>
			{ /* Modal for resetting WooPayments accounts */ }
			<WooPaymentsResetAccountModal
				isOpen={ resetAccountModalVisible }
				onClose={ () => setResetAccountModalVisible( false ) }
				isTestMode={ provider.onboarding?.state?.test_mode }
			/>
		</>
	);
};
