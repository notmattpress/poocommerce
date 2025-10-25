/**
 * External dependencies
 */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import interpolateComponents from '@automattic/interpolate-components';
import { Button } from '@wordpress/components';
import { Link } from '@poocommerce/components';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import WooPaymentsStepHeader from '../../components/header';
import { useOnboardingContext } from '../../data/onboarding-context';
import { WC_ASSET_URL } from '~/utils/admin-settings';
import { recordPaymentsOnboardingEvent } from '~/settings-payments/utils';
import {
	TESTING_ACCOUNT_STEP_ID,
	LIVE_ACCOUNT_STEP_ID,
} from '~/settings-payments/onboarding/providers/woopayments/steps';
import './style.scss';

const TestOrLiveAccountStep = () => {
	const {
		closeModal,
		currentStep,
		sessionEntryPoint,
		navigateToNextStep,
		refreshStoreData,
		getStepByKey,
	} = useOnboardingContext();
	const [ isContinueButtonLoading, setIsContinueButtonLoading ] =
		useState( false );

	const testAccountStepActions = getStepByKey(
		TESTING_ACCOUNT_STEP_ID
	)?.actions;
	const canCreateTestAccount = testAccountStepActions?.finish?.href;

	return (
		<>
			<WooPaymentsStepHeader onClose={ closeModal } />
			<div className="settings-payments-onboarding-modal__step--content">
				<div className="poocommerce-payments-test-or-live-account-step__success_content_container">
					<div className="poocommerce-woopayments-modal__content poocommerce-payments-test-or-live-account-step__success_content">
						<h1 className="poocommerce-payments-test-or-live-account-step__success_content_title">
							{ __(
								"You're almost there — time to activate payments!",
								'poocommerce'
							) }
						</h1>
						<div className="poocommerce-woopayments-modal__content__item">
							<div className="poocommerce-woopayments-modal__content__item__description">
								<p>
									{ __(
										'Activate payments to accept real orders and process transactions.',
										'poocommerce'
									) }
								</p>
							</div>
						</div>
						<div className="poocommerce-payments-test-or-live-account-step__success-whats-next">
							<div className="poocommerce-woopayments-modal__content__item-flex">
								<img
									src={
										WC_ASSET_URL + 'images/icons/dollar.svg'
									}
									alt=""
									role="presentation"
								/>
								<div className="poocommerce-woopayments-modal__content__item-flex__description">
									<h3>
										{ __(
											'Activate real payments',
											'poocommerce'
										) }
									</h3>
									<div>
										{ interpolateComponents( {
											mixedString: __(
												'Provide some additional details about your business to process real transactions. {{link}}Learn more{{/link}}',
												'poocommerce'
											),
											components: {
												link: (
													<Link
														href="https://poocommerce.com/document/woopayments/startup-guide/#sign-up-process"
														target="_blank"
														rel="noreferrer"
														type="external"
													/>
												),
											},
										} ) }
									</div>
								</div>
							</div>
							<Button
								variant="primary"
								onClick={ () => {
									setIsContinueButtonLoading( true );

									recordPaymentsOnboardingEvent(
										'woopayments_onboarding_modal_click',
										{
											step: currentStep?.id || 'unknown',
											action: 'activate_payments',
											source: sessionEntryPoint,
										}
									);

									if ( canCreateTestAccount ) {
										// Mark the test account as finished.
										const actionUrl =
											testAccountStepActions?.finish
												?.href;

										if ( actionUrl ) {
											apiFetch( {
												url: actionUrl,
												method: 'POST',
											} )
												.then( () => {
													setIsContinueButtonLoading(
														false
													);

													refreshStoreData();
												} )
												.catch( () => {
													// Handle any errors that occur during the process.
													setIsContinueButtonLoading(
														false
													);
												} );
										}
									} else {
										// If no test step is present, start the live account creation process directly.
										const liveAccountStep =
											getStepByKey(
												LIVE_ACCOUNT_STEP_ID
											);

										const liveAccountActionURL =
											liveAccountStep?.actions?.start
												?.href;

										if ( liveAccountActionURL ) {
											apiFetch( {
												url: liveAccountActionURL,
												method: 'POST',
											} )
												.then( () => {
													setIsContinueButtonLoading(
														false
													);

													refreshStoreData();
												} )
												.catch( () => {
													// Handle any errors that occur during the process.
													setIsContinueButtonLoading(
														false
													);
												} );
										}
									}
								} }
								isBusy={ isContinueButtonLoading }
								disabled={ isContinueButtonLoading }
							>
								{ __(
									'Start accepting payments',
									'poocommerce'
								) }
							</Button>

							{ canCreateTestAccount && (
								<>
									<div className="poocommerce-payments-test-or-live-account-step__success_content_or-divider">
										<hr />
										{ __( 'OR', 'poocommerce' ) }
										<hr />
									</div>

									<div className="poocommerce-woopayments-modal__content__item-flex">
										<img
											src={
												WC_ASSET_URL +
												'images/icons/post-list.svg'
											}
											alt=""
											role="presentation"
										/>
										<div className="poocommerce-woopayments-modal__content__item-flex__description">
											<h3>
												{ __(
													'Test payments first, activate later',
													'poocommerce'
												) }
											</h3>
											<div>
												<p>
													{ interpolateComponents( {
														mixedString: __(
															"A test account will be created for you to {{link}}test payments on your store{{/link}}. You'll need to activate payments later to process real transactions.",
															'poocommerce'
														),
														components: {
															link: (
																<Link
																	href="https://poocommerce.com/document/woopayments/testing-and-troubleshooting/test-accounts/"
																	target="_blank"
																	rel="noreferrer"
																	type="external"
																/>
															),
														},
													} ) }
												</p>
											</div>
										</div>
									</div>
									<Button
										variant="secondary"
										disabled={ isContinueButtonLoading }
										onClick={ () => {
											navigateToNextStep();
										} }
									>
										{ __( 'Test payments', 'poocommerce' ) }
									</Button>
								</>
							) }
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default TestOrLiveAccountStep;
