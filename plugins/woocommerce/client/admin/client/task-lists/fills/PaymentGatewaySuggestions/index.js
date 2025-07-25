/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	optionsStore,
	onboardingStore,
	PAYMENT_GATEWAYS_STORE_NAME,
	settingsStore,
} from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { useMemo, useCallback, useEffect } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { WooOnboardingTask } from '@poocommerce/onboarding';
import { getNewPath, getQuery } from '@poocommerce/navigation';
import { getAdminLink } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { List, Placeholder as ListPlaceholder } from './components/List';
import { Setup, Placeholder as SetupPlaceholder } from './components/Setup';
import { WCPaySuggestion } from './components/WCPay';
import { WCPayBNPLSuggestion } from './components/WCPayBNPL';
import { getCountryCode } from '~/dashboard/utils';
import {
	getEnrichedPaymentGateways,
	getSplitGateways,
	getIsWCPayOrOtherCategoryDoneSetup,
	getIsGatewayWCPay,
	comparePaymentGatewaysByPriority,
} from './utils';
import './plugins/Bacs';
import './payment-gateway-suggestions.scss';
import { getPluginSlug } from '~/utils';
import { TrackedLink } from '~/components/tracked-link/tracked-link';
import { isFeatureEnabled } from '~/utils/features';

export const PaymentGatewaySuggestions = ( { onComplete, query } ) => {
	const { updatePaymentGateway } = useDispatch( PAYMENT_GATEWAYS_STORE_NAME );
	const {
		getPaymentGateway,
		paymentGatewaySuggestions,
		installedPaymentGateways,
		isResolving,
		countryCode,
	} = useSelect( ( select ) => {
		const { getSettings } = select( settingsStore );
		const { general: settings = {} } = getSettings( 'general' );
		return {
			getPaymentGateway: select( PAYMENT_GATEWAYS_STORE_NAME )
				.getPaymentGateway,
			getOption: select( optionsStore ).getOption,
			installedPaymentGateways: select(
				PAYMENT_GATEWAYS_STORE_NAME
			).getPaymentGateways(),
			isResolving: select( onboardingStore ).isResolving(
				'getPaymentGatewaySuggestions'
			),
			paymentGatewaySuggestions:
				select( onboardingStore ).getPaymentGatewaySuggestions( true ),
			countryCode: getCountryCode( settings.poocommerce_default_country ),
		};
	}, [] );

	const paymentGateways = useMemo(
		() =>
			getEnrichedPaymentGateways(
				installedPaymentGateways,
				paymentGatewaySuggestions
			),
		[ installedPaymentGateways, paymentGatewaySuggestions ]
	);

	const enablePaymentGateway = useCallback(
		( id ) => {
			if ( ! id ) {
				return;
			}

			const gateway = getPaymentGateway( id );

			if ( ! gateway ) {
				return;
			}

			updatePaymentGateway( id, {
				enabled: true,
			} ).then( () => {
				onComplete(
					// use the paymentGateways variable.
					// gateway variable doesn't have hasPlugins property.
					! paymentGateways.get( id )?.hasPlugins
						? {
								// If we are already on a task page, don't redirect.
								// Otherwise, redirect to Payments task page.
								redirectPath: getQuery()?.task
									? getNewPath(
											{ task: getQuery().task },
											{},
											'/'
									  )
									: getNewPath(
											{ task: 'payments' },
											{},
											'/'
									  ),
						  }
						: {}
				);
			} );
		},
		[ getPaymentGateway, updatePaymentGateway, onComplete, paymentGateways ]
	);

	const markConfigured = useCallback(
		async ( id ) => {
			if ( ! paymentGateways.get( id ) ) {
				throw `Payment gateway ${ id } not found in available gateways list`;
			}

			recordEvent( 'tasklist_payment_connect_method', {
				payment_method: id,
			} );

			enablePaymentGateway( id );
		},
		[ paymentGateways, enablePaymentGateway ]
	);

	const recommendation = useMemo(
		() =>
			Array.from( paymentGateways.values() )
				.filter( ( gateway ) => gateway.recommendation_priority )
				.sort( comparePaymentGatewaysByPriority )
				.map( ( gateway ) => gateway.id )
				.shift(),
		[ paymentGateways ]
	);

	const currentGateway = useMemo( () => {
		if ( ! query.id || isResolving || ! paymentGateways.size ) {
			return null;
		}

		// The payment gateways are keyed by the payment gateway suggestion ID, not the plugin ID/slug.
		// The payment gateway suggestion ID is sometimes the same as the plugin ID/slug, but not always.
		// Sometimes it features a : separator, e.g. 'poocommerce-payments:bnpl'.
		// We will discard the part after the : separator when searching for the current gateway.
		const processedQueryId = getPluginSlug( query.id );
		const gateway = Array.from( paymentGateways.entries() ).find(
			( [ key ] ) => getPluginSlug( key ) === processedQueryId
		)?.[ 1 ];

		if ( ! gateway ) {
			throw `Current gateway ${ query.id } not found in available gateways list`;
		}

		return gateway;
	}, [ isResolving, query, paymentGateways ] );

	const isWCPayOrOtherCategoryDoneSetup = useMemo(
		() =>
			getIsWCPayOrOtherCategoryDoneSetup( paymentGateways, countryCode ),
		[ countryCode, paymentGateways ]
	);

	const isWCPaySupported =
		Array.from( paymentGateways.values() ).findIndex(
			getIsGatewayWCPay
		) !== -1;

	const [
		wcPayGateway,
		offlineGateways,
		additionalGateways,
		wcPayBnplGateway,
	] = useMemo(
		() =>
			getSplitGateways(
				paymentGateways,
				countryCode,
				isWCPaySupported,
				isWCPayOrOtherCategoryDoneSetup
			),
		[
			paymentGateways,
			countryCode,
			isWCPaySupported,
			isWCPayOrOtherCategoryDoneSetup,
		]
	);

	useEffect( () => {
		let shownGateways = [];

		if ( ! currentGateway ) {
			if ( wcPayGateway.length ) {
				shownGateways.push( wcPayGateway[ 0 ].id );
			}
			if ( wcPayBnplGateway.length ) {
				shownGateways.push( wcPayBnplGateway[ 0 ].id );
			}
			if ( additionalGateways.length ) {
				shownGateways = shownGateways.concat(
					additionalGateways.map( ( g ) => g.id )
				);
			}
			if ( shownGateways.length ) {
				recordEvent( 'tasklist_payments_options', {
					options: shownGateways,
				} );
			}
		}
	}, [ additionalGateways, currentGateway, wcPayGateway, wcPayBnplGateway ] );

	const trackSeeMore = () => {
		recordEvent( 'tasklist_payment_see_more', {} );
	};

	if ( query.id && ! currentGateway ) {
		return <SetupPlaceholder />;
	}

	if ( currentGateway ) {
		return (
			<Setup
				paymentGateway={ currentGateway }
				markConfigured={ markConfigured }
			/>
		);
	}

	let additionalSectionHeading = __(
		'Choose a payment provider',
		'poocommerce'
	);
	let additionalSectionHeadingDescription = __(
		'To start accepting online payments',
		'poocommerce'
	);
	if ( isWCPayOrOtherCategoryDoneSetup ) {
		additionalSectionHeading = __(
			'Additional payment options',
			'poocommerce'
		);
		additionalSectionHeadingDescription = __(
			'Give your customers additional choices in ways to pay.',
			'poocommerce'
		);
	} else if ( isWCPaySupported ) {
		additionalSectionHeading = __(
			'Other payment providers',
			'poocommerce'
		);
		additionalSectionHeadingDescription = __(
			'Try one of the alternative payment providers.',
			'poocommerce'
		);
	}

	const additionalSection = !! additionalGateways.length && (
		<List
			heading={ additionalSectionHeading }
			headingDescription={ additionalSectionHeadingDescription }
			// No recommendation if WooPayments is supported (and displayed).
			recommendation={ isWCPaySupported ? false : recommendation }
			paymentGateways={ additionalGateways }
			markConfigured={ markConfigured }
			footerLink={
				<TrackedLink
					message={ __(
						// translators: {{Link}} is a placeholder for a html element.
						'Visit {{Link}}the PooCommerce Marketplace{{/Link}} to find additional payment providers.',
						'poocommerce'
					) }
					onClickCallback={ trackSeeMore }
					targetUrl={
						isFeatureEnabled( 'marketplace' )
							? getAdminLink(
									'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=payment-gateways'
							  )
							: 'https://poocommerce.com/product-category/poocommerce-extensions/payment-gateways/'
					}
					linkType={
						isFeatureEnabled( 'marketplace' )
							? 'wc-admin'
							: 'external'
					}
				/>
			}
		></List>
	);

	const offlineSection = !! offlineGateways.length && (
		<List
			heading={ __( 'Offline payment methods', 'poocommerce' ) }
			// No recommendation if WooPayments is supported (and displayed).
			recommendation={ isWCPaySupported ? false : recommendation }
			paymentGateways={ offlineGateways }
			markConfigured={ markConfigured }
		/>
	);

	return (
		<div className="poocommerce-task-payments">
			{ ! paymentGateways.size && <ListPlaceholder /> }

			{ wcPayGateway.length ? (
				<>
					<WCPaySuggestion paymentGateway={ wcPayGateway[ 0 ] } />
					{ additionalSection }
					{ offlineSection }
				</>
			) : (
				<>
					{ additionalSection }
					{ !! wcPayBnplGateway.length && (
						<WCPayBNPLSuggestion
							paymentGateway={ wcPayBnplGateway[ 0 ] }
						/>
					) }
					{ offlineSection }
				</>
			) }
		</div>
	);
};

registerPlugin( 'wc-admin-onboarding-task-payments', {
	scope: 'poocommerce-tasks',
	render: () => (
		<WooOnboardingTask id="payments">
			{ ( { onComplete, query } ) => (
				<PaymentGatewaySuggestions
					onComplete={ onComplete }
					query={ query }
				/>
			) }
		</WooOnboardingTask>
	),
} );
