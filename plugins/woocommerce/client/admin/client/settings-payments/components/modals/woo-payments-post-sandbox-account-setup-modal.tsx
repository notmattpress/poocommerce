/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { Link } from '@poocommerce/components';
import { getAdminLink } from '@poocommerce/settings';
import interpolateComponents from '@automattic/interpolate-components';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './modals.scss';
import { getWooPaymentsSetupLiveAccountLink } from '~/settings-payments/utils';
import { WC_ASSET_URL } from '~/utils/admin-settings';

interface WooPaymentsReadyToTestModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const WooPaymentsPostSandboxAccountSetupModal = ( {
	isOpen,
	onClose,
}: WooPaymentsReadyToTestModalProps ) => {
	const [ isActivatingPayments, setIsActivatingPayments ] = useState( false );
	const [ isContinuingStoreSetup, setIsContinuingStoreSetup ] =
		useState( false );
	const handleActivatePayments = () => {
		setIsActivatingPayments( true );

		window.location.href = getWooPaymentsSetupLiveAccountLink();
	};

	const handleContinueStoreSetup = () => {
		setIsContinuingStoreSetup( true );

		window.location.href = getAdminLink( 'admin.php?page=wc-admin' );
	};

	return (
		<>
			{ isOpen && (
				<Modal
					title={ __(
						"You're ready to test payments!",
						'poocommerce'
					) }
					className="poocommerce-woopayments-modal"
					isDismissible={ true }
					onRequestClose={ onClose }
				>
					<div className="poocommerce-woopayments-modal__content">
						<div className="poocommerce-woopayments-modal__content__item">
							<div className="poocommerce-woopayments-modal__content__item__description">
								<p>
									{ interpolateComponents( {
										mixedString: __(
											"We've created a test account for you so that you can begin testing payments on your store. Not sure what to test? Take a look at {{link}}how to test payments{{/link}}.",
											'poocommerce'
										),
										components: {
											link: (
												<Link
													href="https://poocommerce.com/document/woopayments/testing-and-troubleshooting/sandbox-mode/"
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
						<div className="poocommerce-woopayments-modal__content__item">
							<h2>{ __( "What's next:", 'poocommerce' ) }</h2>
						</div>
						<div className="poocommerce-woopayments-modal__content__item-flex">
							<img
								src={ WC_ASSET_URL + 'images/icons/store.svg' }
								alt="store icon"
							/>
							<div className="poocommerce-woopayments-modal__content__item-flex__description">
								<h3>
									{ __(
										'Continue your store setup',
										'poocommerce'
									) }
								</h3>
								<div>
									{ __(
										'Finish completing the tasks required to launch your store.',
										'poocommerce'
									) }
								</div>
							</div>
						</div>
						<div className="poocommerce-woopayments-modal__content__item-flex">
							<img
								src={ WC_ASSET_URL + 'images/icons/dollar.svg' }
								alt="dollar icon"
							/>
							<div className="poocommerce-woopayments-modal__content__item-flex__description">
								<h3>
									{ __( 'Activate payments', 'poocommerce' ) }
								</h3>
								<div>
									<p>
										{ interpolateComponents( {
											mixedString: __(
												'Provide some additional details about your business so you can being accepting real payments. {{link}}Learn more{{/link}}',
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
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="poocommerce-woopayments-modal__actions">
						<Button
							variant="primary"
							isBusy={ isContinuingStoreSetup }
							disabled={ isContinuingStoreSetup }
							onClick={ handleContinueStoreSetup }
						>
							{ __( 'Continue store setup', 'poocommerce' ) }
						</Button>
						<Button
							variant="secondary"
							isBusy={ isActivatingPayments }
							disabled={ isActivatingPayments }
							onClick={ handleActivatePayments }
						>
							{ __( 'Activate payments', 'poocommerce' ) }
						</Button>
					</div>
				</Modal>
			) }
		</>
	);
};
