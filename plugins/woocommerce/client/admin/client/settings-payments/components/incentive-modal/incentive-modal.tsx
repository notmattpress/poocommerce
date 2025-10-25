/**
 * External dependencies
 */
import { useEffect } from 'react';
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
import {
	PaymentsProviderIncentive,
	PaymentsProvider,
	PaymentsEntity,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import './incentive-modal.scss';
import { StatusBadge } from '~/settings-payments/components/status-badge';
import { WC_ASSET_URL } from '~/utils/admin-settings';
import {
	isIncentiveDismissedInContext,
	recordPaymentsEvent,
} from '~/settings-payments/utils';

interface IncentiveModalProps {
	/**
	 * Incentive data.
	 */
	incentive: PaymentsProviderIncentive;
	/**
	 * Payments provider.
	 */
	provider: PaymentsProvider;
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
	 * @param doNotTrack  Optional. If true, the dismissal should not be tracked.
	 */
	onDismiss: (
		dismissUrl: string,
		context: string,
		doNotTrack?: boolean
	) => void;
	/**
	 * Callback to set up the plugin.
	 *
	 * @param provider      Extension provider.
	 * @param onboardingUrl Extension onboarding URL (if available).
	 * @param attachUrl     Extension attach URL (if available).
	 * @param context       The context from which the plugin is set up (e.g. 'wc_settings_payments__incentive_modal').
	 */
	setUpPlugin: (
		provider: PaymentsEntity,
		onboardingUrl: string | null,
		attachUrl: string | null,
		context?: string
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
	setUpPlugin,
}: IncentiveModalProps ) => {
	const [ isBusy, setIsBusy ] = useState( false );
	const [ isOpen, setIsOpen ] = useState( true );

	const context = 'wc_settings_payments__modal';
	const isDismissed = isIncentiveDismissedInContext( incentive, context );

	useEffect( () => {
		// Record the event when the incentive is shown.
		recordPaymentsEvent( 'incentive_show', {
			incentive_id: incentive.promo_id,
			provider_id: provider.id,
			suggestion_id: provider._suggestion_id ?? 'unknown',
			display_context: context,
		} );
	}, [ incentive, provider ] );

	/**
	 * Closes the modal.
	 */
	const handleClose = () => {
		setIsOpen( false );
	};

	/**
	 * Handles explicitly accepting the incentive via the modal CTA button.
	 *
	 * Triggers the onAccept callback, dismisses the incentive, closes the modal, and trigger plugin setup.
	 */
	const handleAccept = () => {
		// Record the event when the user accepts the incentive.
		recordPaymentsEvent( 'incentive_accept', {
			incentive_id: incentive.promo_id,
			provider_id: provider.id,
			suggestion_id: provider._suggestion_id ?? 'unknown',
			display_context: context,
		} );

		// Accept the incentive and set up the plugin.
		setIsBusy( true );
		onAccept( incentive.promo_id );
		// We also dismiss the incentive when it is accepted.
		onDismiss( incentive._links.dismiss.href, context, true );
		handleClose(); // Close the modal.
		setUpPlugin(
			provider,
			onboardingUrl,
			provider.plugin.status === 'not_installed'
				? provider._links?.attach?.href ?? null
				: null,
			'wc_settings_payments__incentive_modal'
		);
		setIsBusy( false );
	};

	/**
	 * Handles dismissing the incentive.
	 * Triggers the onDismiss callback and hides the modal.
	 */
	const handleDismiss = () => {
		// Dismiss the incentive.
		onDismiss( incentive._links.dismiss.href, context );
		handleClose();
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
					onRequestClose={ handleDismiss }
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
