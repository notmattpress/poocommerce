/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import {
	paymentSettingsStore,
	woopaymentsOnboardingStore,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import './modals.scss';
import {
	recordPaymentsEvent,
	resetWooPaymentsAccount,
} from '~/settings-payments/utils';
import {
	wooPaymentsExtensionSlug,
	wooPaymentsProviderId,
	wooPaymentsSuggestionId,
} from '~/settings-payments/constants';

interface WooPaymentsResetAccountModalProps {
	/**
	 * Indicates if the modal is currently open.
	 */
	isOpen: boolean;
	/**
	 * Callback function to handle modal closure.
	 */
	onClose: () => void;

	/**
	 * Indicates if the account is a test-drive/sandbox account.
	 */
	isTestMode?: boolean;

	/**
	 * Indicate if the reset flow is embedded (ie inside NOX).
	 */
	isEmbeddedResetFlow?: boolean;
}

/**
 * A modal component that allows users to reset their WooPayments test account.
 */
export const WooPaymentsResetAccountModal = ( {
	isOpen,
	onClose,
	isTestMode,
	isEmbeddedResetFlow = false,
}: WooPaymentsResetAccountModalProps ) => {
	const [ isResettingAccount, setIsResettingAccount ] = useState( false );
	const { invalidateResolutionForStoreSelector: invalidatePaymentGateways } =
		useDispatch( paymentSettingsStore );
	const {
		invalidateResolutionForStoreSelector: invalidateWooPaymentsOnboarding,
	} = useDispatch( woopaymentsOnboardingStore );
	const { createNotice } = useDispatch( 'core/notices' );

	/**
	 * Handles the "Reset Account" action.
	 * Redirects the user to the WooPayments reset account link.
	 */
	const handleResetAccount = () => {
		setIsResettingAccount( true );

		resetWooPaymentsAccount()
			.then( () => {
				recordPaymentsEvent( 'provider_reset_onboarding_success', {
					provider_id: wooPaymentsProviderId,
					suggestion_id: wooPaymentsSuggestionId,
					provider_extension_slug: wooPaymentsExtensionSlug,
				} );
				// Refresh the providers store.
				invalidatePaymentGateways( 'getPaymentProviders' );
				// Refresh the WooPayments in-context onboarding store.
				invalidateWooPaymentsOnboarding( 'getOnboardingData' );
			} )
			.catch( () => {
				recordPaymentsEvent( 'provider_reset_onboarding_failed', {
					provider_id: wooPaymentsProviderId,
					suggestion_id: wooPaymentsSuggestionId,
					provider_extension_slug: wooPaymentsExtensionSlug,
					reason: 'error',
				} );
				createNotice(
					'error',
					__(
						'Failed to reset your WooPayments account.',
						'poocommerce'
					),
					{
						isDismissible: true,
					}
				);
			} )
			.finally( () => {
				setIsResettingAccount( false );
				onClose();
			} );
	};

	let content = isTestMode
		? sprintf(
				/* translators: %s: plugin name */
				__(
					'When you reset your test account, all payment data — including your %s account details, test transactions, and payouts history — will be lost. Your order history will remain. This action cannot be undone, but you can create a new test account at any time.',
					'poocommerce'
				),
				'WooPayments'
		  )
		: sprintf(
				/* translators: %s: plugin name */
				__(
					'When you reset your account, all payment data — including your %s account details, test transactions, and payouts history — will be lost. Your order history will remain. This action cannot be undone, but you can create a new test account at any time.',
					'poocommerce'
				),
				'WooPayments'
		  );

	if ( isEmbeddedResetFlow ) {
		// If reseting the account from NOX, override the content.
		content = sprintf(
			/* translators: %1$s: plugin name, %2$s: plugin name */
			__(
				'You need to reset your test account to continue onboarding with %1$s. This will create a new test account and reset any existing %2$s account details and test transactions.',
				'poocommerce'
			),
			'WooPayments',
			'WooPayments'
		);
	}
	return (
		<>
			{ isOpen && (
				<Modal
					title={ __( 'Reset your test account', 'poocommerce' ) }
					className="poocommerce-woopayments-modal"
					isDismissible={ true }
					onRequestClose={ onClose }
				>
					<div className="poocommerce-woopayments-modal__content">
						<div className="poocommerce-woopayments-modal__content__item">
							<div>
								<span>{ content }</span>
							</div>
						</div>
						<div className="poocommerce-woopayments-modal__content__item">
							<h3>
								{ __(
									"Are you sure you'd like to continue?",
									'poocommerce'
								) }
							</h3>
						</div>
					</div>
					<div className="poocommerce-woopayments-modal__actions">
						<Button
							className={ isEmbeddedResetFlow ? '' : 'danger' }
							variant={
								isEmbeddedResetFlow ? 'primary' : 'secondary'
							}
							isBusy={ isResettingAccount }
							disabled={ isResettingAccount }
							onClick={ () => {
								recordPaymentsEvent(
									'provider_reset_onboarding_confirmation_click',
									{
										provider_id: wooPaymentsProviderId,
										suggestion_id: wooPaymentsSuggestionId,
										provider_extension_slug:
											wooPaymentsExtensionSlug,
									}
								);
								handleResetAccount();
							} }
						>
							{ __( 'Yes, reset account', 'poocommerce' ) }
						</Button>
					</div>
				</Modal>
			) }
		</>
	);
};
