/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useOnboardingContext } from '../../data/onboarding-context';
import WooPaymentsStepHeader from '../../components/header';
import './style.scss';
import { recordPaymentsOnboardingEvent } from '~/settings-payments/utils';

export const FinishStep: React.FC = () => {
	const { context, closeModal, sessionEntryPoint } = useOnboardingContext();

	return (
		<>
			<WooPaymentsStepHeader onClose={ closeModal } />
			<div className="settings-payments-onboarding-modal__step--content">
				<div className="settings-payments-onboarding-modal__step--content-finish">
					<h1 className="settings-payments-onboarding-modal__step--content-finish-title">
						{ __(
							'You’re ready to accept payments!',
							'poocommerce'
						) }
					</h1>
					<p className="settings-payments-onboarding-modal__step--content-finish-description">
						{ __(
							'Great news — your WooPayments account has been activated. You can now start accepting payments on your store.',
							'poocommerce'
						) }
					</p>
					<Button
						variant="primary"
						className="settings-payments-onboarding-modal__step--content-finish-primary-button"
						onClick={ () => {
							// Record the event when the user clicks on the button.
							recordPaymentsOnboardingEvent(
								'woopayments_onboarding_modal_click',
								{
									step: 'finish',
									action: 'go_to_payments_overview',
									source: sessionEntryPoint,
								}
							);

							window.location.href =
								context?.urls?.overview_page ?? '';
						} }
					>
						{ __( 'Go to Payments Overview', 'poocommerce' ) }
					</Button>
					<div className="divider">
						<span className="divider-line"></span>
						<span className="divider-text">
							{ __( 'OR', 'poocommerce' ) }
						</span>
						<span className="divider-line"></span>
					</div>
					<Button
						variant="secondary"
						className="settings-payments-onboarding-modal__step--content-finish-secondary-button"
						onClick={ () => {
							// Record the event when the user clicks on the button.
							recordPaymentsOnboardingEvent(
								'woopayments_onboarding_modal_click',
								{
									step: 'finish',
									action: 'close_window',
									source: sessionEntryPoint,
								}
							);

							closeModal();
						} }
					>
						{ __( 'Close this window', 'poocommerce' ) }
					</Button>
				</div>
			</div>
		</>
	);
};

export default FinishStep;
