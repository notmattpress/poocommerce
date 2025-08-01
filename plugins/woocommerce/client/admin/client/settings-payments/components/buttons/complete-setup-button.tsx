/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import {
	PaymentGatewayProvider,
	PaymentsProviderIncentive,
	woopaymentsOnboardingStore,
} from '@poocommerce/data';
import { getHistory, getNewPath } from '@poocommerce/navigation';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import {
	isWooPayments,
	recordPaymentsOnboardingEvent,
	recordPaymentsProviderEvent,
} from '~/settings-payments/utils';
import { wooPaymentsOnboardingSessionEntrySettings } from '~/settings-payments/constants';

interface CompleteSetupButtonProps {
	/**
	 * The provider details for the payment gateway.
	 */
	gatewayProvider: PaymentGatewayProvider;
	/**
	 * The settings URL to navigate to, if we don't have an onboarding URL.
	 */
	settingsHref: string;
	/**
	 * The onboarding URL to navigate to when the gateway needs setup.
	 */
	onboardingHref: string;
	/**
	 * Whether the gateway has a list of recommended payment methods to use during the native onboarding flow.
	 */
	gatewayHasRecommendedPaymentMethods: boolean;
	/**
	 * The text of the button.
	 */
	buttonText?: string;
	/**
	 * ID of the plugin that is being installed.
	 */
	installingPlugin: string | null;
	/**
	 * Function to set the onboarding modal open.
	 */
	setOnboardingModalOpen: ( isOnboardingModalOpen: boolean ) => void;
	/**
	 * The onboarding type for the gateway.
	 */
	onboardingType?: string;
	/**
	 * Callback used when an incentive is accepted.
	 *
	 * @param id Incentive ID.
	 */
	acceptIncentive?: ( id: string ) => void;
	/**
	 * Incentive data. If provided, the incentive will be accepted when the button is clicked.
	 */
	incentive?: PaymentsProviderIncentive | null;
}

/**
 * A button component that guides users through completing the setup for a payment gateway.
 * The button dynamically determines the appropriate action (e.g., redirecting to onboarding
 * or settings) based on the gateway's and onboarding state.
 */
export const CompleteSetupButton = ( {
	gatewayProvider,
	settingsHref,
	onboardingHref,
	gatewayHasRecommendedPaymentMethods,
	installingPlugin,
	buttonText = __( 'Complete setup', 'poocommerce' ),
	setOnboardingModalOpen,
	onboardingType,
	acceptIncentive = () => {},
	incentive = null,
}: CompleteSetupButtonProps ) => {
	const [ isUpdating, setIsUpdating ] = useState( false );

	// Get the store's `select` function to trigger selector resolution later (in useEffect).
	// We don't need to select data directly here, just the function itself.
	const { select } = useSelect(
		( selectFn ) => ( { select: selectFn } ),
		[]
	);

	const accountConnected = gatewayProvider.state.account_connected;
	const onboardingStarted = gatewayProvider.onboarding.state.started;
	const onboardingCompleted = gatewayProvider.onboarding.state.completed;

	useEffect( () => {
		// Prefetch WooPayments onboarding data if conditions are met
		if (
			isWooPayments( gatewayProvider.id ) &&
			onboardingType === 'native_in_context' &&
			! onboardingCompleted
		) {
			// Calling the selector triggers the data fetch
			select( woopaymentsOnboardingStore ).getOnboardingData();
		}
	}, [ gatewayProvider.id, onboardingCompleted, onboardingType, select ] );

	const completeSetup = () => {
		// Record the click of this button.
		recordPaymentsProviderEvent( 'complete_setup_click', gatewayProvider );

		setIsUpdating( true );

		if ( incentive ) {
			acceptIncentive( incentive.promo_id );
		}

		if ( onboardingType === 'native_in_context' ) {
			recordPaymentsOnboardingEvent(
				'woopayments_onboarding_modal_opened',
				{
					from: 'complete_setup_button',
					source: wooPaymentsOnboardingSessionEntrySettings,
				}
			);
			setOnboardingModalOpen( true );
		} else if ( ! accountConnected || ! onboardingStarted ) {
			if ( gatewayHasRecommendedPaymentMethods ) {
				const history = getHistory();
				history.push( getNewPath( {}, '/payment-methods' ) );
			} else {
				// Redirect to the gateway's onboarding URL if it needs setup.
				window.location.href = onboardingHref;
				return;
			}
		} else if (
			accountConnected &&
			onboardingStarted &&
			! onboardingCompleted
		) {
			// Redirect to the gateway's onboarding URL if it needs setup.
			window.location.href = onboardingHref;
			return;
		} else {
			// Redirect to the gateway's settings URL if the account is already connected.
			window.location.href = settingsHref;
			return;
		}

		setIsUpdating( false );
	};

	return (
		<Button
			key={ gatewayProvider.id }
			variant={ 'primary' }
			isBusy={ isUpdating }
			disabled={ isUpdating || !! installingPlugin }
			onClick={ completeSetup }
		>
			{ buttonText }
		</Button>
	);
};
