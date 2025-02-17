/**
 * External dependencies
 */
import React from 'react';
import {
	Button,
	Card,
	CardBody,
	CardMedia,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useState } from '@wordpress/element';
import { Link } from '@poocommerce/components';
import { PaymentIncentive, PaymentProvider } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import './incentive-modal.scss';
import { StatusBadge } from '~/settings-payments/components/status-badge';
import { WC_ASSET_URL } from '~/utils/admin-settings';
import { isIncentiveDismissedInContext } from '~/settings-payments/utils';

interface IncentiveModalProps {
	/**
	 * Incentive data.
	 */
	incentive: PaymentIncentive;
	/**
	 * Payment provider.
	 */
	provider: PaymentProvider;
	/**
	 * Onboarding URL (if available).
	 */
	onboardingUrl: string | null;
	/**
	 * Callback used when an incentive is accepted.
	 *
	 * @param id Incentive ID.
	 */
	onAccept: ( id: string ) => void;
	/**
	 * Callback to handle dismiss action.
	 *
	 * @param dismissHref Dismiss URL.
	 * @param context     The context in which the incentive is dismissed. (e.g. whether it was in a modal or banner).
	 */
	onDismiss: ( dismissUrl: string, context: string ) => void;
	/**
	 * Callback to setup the plugin.
	 *
	 * @param id            Extension ID.
	 * @param slug          Extension slug.
	 * @param onboardingUrl Onboarding URL (if available).
	 */
	setupPlugin: (
		id: string,
		slug: string,
		onboardingUrl: string | null
	) => void;
}

/**
 * A modal component that displays a promotional incentive to the user.
 * The modal allows the user to:
 * - Accept the incentive, triggering setup actions.
 * - Dismiss the incentive, removing it from the current context.
 *
 * This component manages its own visibility state. If the incentive is already dismissed
 * for the current context, the modal does not render.
 */
export const IncentiveModal = ( {
	incentive,
	provider,
	onboardingUrl,
	onAccept,
	onDismiss,
	setupPlugin,
}: IncentiveModalProps ) => {
	const [ isBusy, setIsBusy ] = useState( false );
	const [ isOpen, setIsOpen ] = useState( true );

	const context = 'wc_settings_payments__modal';
	const isDismissed = isIncentiveDismissedInContext( incentive, context );

	/**
	 * Closes the modal.
	 */
	const handleClose = () => {
		setIsOpen( false );
	};

	/**
	 * Handles accepting the incentive.
	 * Triggers the onAccept callback, dismisses the incentive, closes the modal, and trigger plugin setup.
	 */
	const handleAccept = () => {
		setIsBusy( true );
		onAccept( incentive.promo_id );
		onDismiss( incentive._links.dismiss.href, context ); // We also dismiss the incentive when it is accepted.
		handleClose(); // Close the modal.
		setupPlugin( provider.id, provider.plugin.slug, onboardingUrl );
		setIsBusy( false );
	};

	// Do not render the modal if the incentive is dismissed in this context.
	if ( isDismissed ) {
		return null;
	}

	return (
		<>
			{ isOpen && (
				<Modal
					title=""
					className="poocommerce-incentive-modal"
					onRequestClose={ () => {
						onDismiss( incentive._links.dismiss.href, context );
						handleClose();
					} }
				>
					<Card className={ 'poocommerce-incentive-modal__card' }>
						<div className="poocommerce-incentive-modal__content">
							<CardMedia
								className={
									'poocommerce-incentive-modal__media'
								}
							>
								<img
									src={
										WC_ASSET_URL +
										'images/settings-payments/incentives-illustration.svg'
									}
									alt={ __(
										'Incentive illustration',
										'poocommerce'
									) }
								/>
							</CardMedia>
							<CardBody
								className={
									'poocommerce-incentive-modal__body'
								}
							>
								<div>
									<StatusBadge
										status={ 'has_incentive' }
										message={ __(
											'Limited time offer',
											'poocommerce'
										) }
									/>
								</div>
								<h2>{ incentive.title }</h2>
								<p>{ incentive.description }</p>
								<p
									className={
										'poocommerce-incentive-modal__terms'
									}
								>
									{ createInterpolateElement(
										__(
											'See <termsLink /> for details.',
											'poocommerce'
										),
										{
											termsLink: (
												<Link
													href={ incentive.tc_url }
													target="_blank"
													rel="noreferrer"
													type="external"
												>
													{ __(
														'Terms and Conditions',
														'poocommerce'
													) }
												</Link>
											),
										}
									) }
								</p>
								<div className="poocommerce-incentive-model__actions">
									<Button
										variant={ 'primary' }
										isBusy={ isBusy }
										disabled={ isBusy }
										onClick={ handleAccept }
									>
										{ incentive.cta_label }
									</Button>
								</div>
							</CardBody>
						</div>
					</Card>
				</Modal>
			) }
		</>
	);
};
