/**
 * External dependencies
 */
import { useEffect } from 'react';
import { Button, Card, CardBody } from '@wordpress/components';
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
import { WC_ASSET_URL } from '~/utils/admin-settings';
import './incentive-banner.scss';
import { StatusBadge } from '~/settings-payments/components/status-badge';
import {
	isIncentiveDismissedInContext,
	recordPaymentsEvent,
} from '~/settings-payments/utils';

interface IncentiveBannerProps {
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
	 * @param dismissUrl Dismiss URL.
	 * @param context    The context in which the incentive is dismissed. (e.g. whether it was in a modal or banner).
	 * @param doNotTrack Optional. If true, the dismissal should not be tracked.
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
	 * @param context       The context from which the plugin is set up (e.g. 'wc_settings_payments__incentive_banner').
	 */
	setUpPlugin: (
		provider: PaymentsEntity,
		onboardingUrl: string | null,
		attachUrl: string | null,
		context?: string
	) => void;
}

/**
 * A banner component that displays a promotional incentive to the user. The banner allows the user to:
 * - Accept the incentive, triggering setup actions.
 * - Dismiss the incentive, removing it from the current context.
 */
export const IncentiveBanner = ( {
	incentive,
	provider,
	onboardingUrl,
	onDismiss,
	onAccept,
	setUpPlugin,
}: IncentiveBannerProps ) => {
	const [ isSubmitted, setIsSubmitted ] = useState( false );
	const [ isDismissed, setIsDismissed ] = useState( false );
	const [ isBusy, setIsBusy ] = useState( false );

	const context = 'wc_settings_payments__banner';

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
	 * Handles explicitly accepting the incentive via the banner CTA button.
	 *
	 * Triggers the onAccept callback, dismisses the banner, and triggers plugin setup.
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
		// But do not track this since it is not a true dismissal.
		onDismiss( incentive._links.dismiss.href, context, true );
		setIsSubmitted( true );
		setUpPlugin(
			provider,
			onboardingUrl,
			provider.plugin.status === 'not_installed'
				? provider._links?.attach?.href ?? null
				: null,
			'wc_settings_payments__incentive_banner'
		);
		setIsBusy( false );
	};

	/**
	 * Handles dismissing the incentive.
	 * Triggers the onDismiss callback and hides the banner.
	 */
	const handleDismiss = () => {
		// Dismiss the incentive.
		setIsBusy( true );
		onDismiss( incentive._links.dismiss.href, context );
		setIsBusy( false );
		setIsDismissed( true );
	};

	// Do not render the banner if it has been submitted, dismissed, or already dismissed in this context.
	if (
		isSubmitted ||
		isIncentiveDismissedInContext( incentive, context ) ||
		isDismissed
	) {
		return null;
	}

	return (
		<Card className="poocommerce-incentive-banner" isRounded={ true }>
			<div className="poocommerce-incentive-banner__content">
				<div className={ 'poocommerce-incentive-banner__image' }>
					<img
						src={
							WC_ASSET_URL +
							'images/settings-payments/incentives-illustration.svg'
						}
						alt={ __( 'Incentive illustration', 'poocommerce' ) }
					/>
				</div>
				<CardBody className="poocommerce-incentive-banner__body">
					<StatusBadge
						status="has_incentive"
						message={ __( 'Limited time offer', 'poocommerce' ) }
					/>

					<div className={ 'poocommerce-incentive-banner__copy' }>
						<h2>{ incentive.title }</h2>
						<p>{ incentive.description }</p>
					</div>

					<div className={ 'poocommerce-incentive-banner__terms' }>
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
					</div>

					<div className={ 'poocommerce-incentive-banner__actions' }>
						<Button
							variant={ 'primary' }
							isBusy={ isSubmitted }
							disabled={ isSubmitted }
							onClick={ handleAccept }
						>
							{ incentive.cta_label }
						</Button>
						<Button
							variant={ 'tertiary' }
							isBusy={ isBusy }
							disabled={ isBusy }
							onClick={ handleDismiss }
						>
							{ __( 'Dismiss', 'poocommerce' ) }
						</Button>
					</div>
				</CardBody>
			</div>
		</Card>
	);
};
