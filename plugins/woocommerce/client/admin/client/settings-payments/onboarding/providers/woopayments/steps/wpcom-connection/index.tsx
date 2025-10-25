/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { useOnboardingContext } from '../../data/onboarding-context';
import WooPaymentsStepHeader from '../../components/header';
import './style.scss';
import { recordPaymentsOnboardingEvent } from '~/settings-payments/utils';

export const JetpackStep: React.FC = () => {
	const { currentStep, closeModal, sessionEntryPoint } =
		useOnboardingContext();
	const [ isConnectButtonLoading, setIsConnectButtonLoading ] =
		useState( false );

	return (
		<>
			<WooPaymentsStepHeader onClose={ closeModal } />
			<div className="settings-payments-onboarding-modal__step--content">
				<div className="settings-payments-onboarding-modal__step--content-jetpack">
					<h1 className="settings-payments-onboarding-modal__step--content-jetpack-title">
						{ __( 'Connect to WordPress.com', 'poocommerce' ) }
					</h1>
					<p className="settings-payments-onboarding-modal__step--content-jetpack-description">
						{ __(
							'You’ll be briefly redirected to connect your store to your WordPress.com account and unlock the full features and functionality of WooPayments',
							'poocommerce'
						) }
					</p>
					<Button
						variant="primary"
						className="settings-payments-onboarding-modal__step--content-jetpack-button"
						isBusy={ isConnectButtonLoading }
						disabled={ isConnectButtonLoading }
						onClick={ () => {
							setIsConnectButtonLoading( true );

							// Mark the step as started.
							const startUrl = currentStep?.actions?.start?.href;
							if ( startUrl ) {
								// No need to wait for the response.
								apiFetch( {
									url: startUrl,
									method: 'POST',
									data: {
										source: sessionEntryPoint,
									},
								} );
							}

							// Track the connection button click event.
							recordPaymentsOnboardingEvent(
								'woopayments_onboarding_modal_click',
								{
									step: currentStep?.id || 'unknown',
									action: 'connect_to_wpcom',
									source: sessionEntryPoint,
								}
							);

							// Redirect to the WordPress.com connection authorization URL.
							window.location.href =
								currentStep?.actions?.auth?.href ?? '';
						} }
					>
						{ __( 'Connect', 'poocommerce' ) }
					</Button>
				</div>
			</div>
		</>
	);
};

export default JetpackStep;
