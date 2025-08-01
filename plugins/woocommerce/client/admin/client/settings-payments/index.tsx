/**
 * External dependencies
 */
import { Gridicon } from '@automattic/components';
import { Button, Placeholder, SelectControl } from '@wordpress/components';
import { paymentSettingsStore } from '@poocommerce/data';
import { useSelect } from '@wordpress/data';
import React, {
	useState,
	lazy,
	Suspense,
	useCallback,
	useEffect,
} from '@wordpress/element';
import {
	unstable_HistoryRouter as HistoryRouter,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';
import { getHistory, getNewPath } from '@poocommerce/navigation';
import { __, sprintf } from '@wordpress/i18n';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { Header } from './components/header/header';
import { BackButton } from './components/buttons/back-button';
import { ListPlaceholder } from '~/settings-payments/components/list-placeholder';
import {
	getWooPaymentsTestDriveAccountLink,
	getWooPaymentsFromProviders,
} from '~/settings-payments/utils';
import './settings-payments-main.scss';

/**
 * Lazy-loaded chunk for the main settings page of payment gateways.
 */
const SettingsPaymentsMainChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "settings-payments-main" */ './settings-payments-main'
		)
);

/**
 * Lazy-loaded chunk for the recommended payment methods settings page.
 */
const SettingsPaymentsMethodsChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "settings-payments-methods" */ './settings-payments-methods'
		)
);

/**
 * Lazy-loaded chunk for the offline payment gateways settings page.
 */
const SettingsPaymentsOfflineChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "settings-payments-offline" */ './settings-payments-offline'
		)
);

/**
 * Lazy-loaded chunk for the WooPayments settings page.
 */
const SettingsPaymentsWooPaymentsChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "settings-payments-poocommerce-payments" */ './settings-payments-woopayments'
		)
);

const SettingsPaymentsBacsChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "settings-payments-bacs" */ './offline/settings-payments-bacs'
		)
);

const SettingsPaymentsCodChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "settings-payments-cod" */ './offline/settings-payments-cod'
		)
);

const SettingsPaymentsChequeChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "settings-payments-cheque" */ './offline/settings-payments-cheque'
		)
);

interface OfflinePaymentGatewayWrapperProps {
	title: string;
	chunkComponent: React.ComponentType;
}

const OfflinePaymentGatewayWrapper = ( {
	title,
	chunkComponent: ChunkComponent,
}: OfflinePaymentGatewayWrapperProps ) => {
	return (
		<>
			<div className="settings-payments-offline__container">
				<div className="settings-payment-gateways">
					<div className="settings-payments-offline__header">
						<BackButton
							href={ getNewPath( {}, '/offline' ) }
							title={ __(
								'Return to payments settings',
								'poocommerce'
							) }
							isRoute={ true }
							from={ 'woopayments_payment_methods' }
						/>
						<h1 className="components-truncate components-text poocommerce-layout__header-heading poocommerce-layout__header-left-align settings-payments-offline__header-title">
							<span className="poocommerce-settings-payments-header__title">
								{ title }
							</span>
						</h1>
					</div>
					<Suspense fallback={ <Placeholder /> }>
						<ChunkComponent />
					</Suspense>
				</div>
			</div>
		</>
	);
};

/**
 * Hides or displays the PooCommerce navigation tab based on the provided display style.
 */
const hidePooCommerceNavTab = ( display: string ) => {
	const externalElement = document.querySelector< HTMLElement >(
		'.woo-nav-tab-wrapper'
	);

	// Add the 'hidden' class to hide the element.
	if ( externalElement ) {
		externalElement.style.display = display;
	}
};

/**
 * Renders the main payment settings page with a fallback while loading.
 */
const SettingsPaymentsMain = () => {
	const location = useLocation();

	useEffect( () => {
		if ( location.pathname === '' ) {
			hidePooCommerceNavTab( 'flex' );
		}
	}, [ location ] );
	return (
		<>
			<Suspense
				fallback={
					<>
						<div className="settings-payments-main__container">
							<div className="settings-payment-gateways">
								<div className="settings-payment-gateways__header">
									<div className="settings-payment-gateways__header-title">
										{ __(
											'Payment providers',
											'poocommerce'
										) }
									</div>
									<div className="settings-payment-gateways__header-select-container">
										<SelectControl
											className="poocommerce-select-control__country"
											prefix={ __(
												'Business location :',
												'poocommerce'
											) }
											// eslint-disable-next-line @typescript-eslint/ban-ts-comment
											// @ts-ignore placeholder prop exists
											placeholder={ '' }
											label={ '' }
											options={ [] }
											onChange={ () => {} }
										/>
									</div>
								</div>
								<ListPlaceholder rows={ 5 } />
							</div>
							<div className="other-payment-gateways">
								<div className="other-payment-gateways__header">
									<div className="other-payment-gateways__header__title">
										<span>
											{ __(
												'Other payment options',
												'poocommerce'
											) }
										</span>
										<>
											<div className="other-payment-gateways__header__title__image-placeholder" />
											<div className="other-payment-gateways__header__title__image-placeholder" />
											<div className="other-payment-gateways__header__title__image-placeholder" />
										</>
									</div>
									<Button
										variant={ 'link' }
										onClick={ () => {} }
										aria-expanded={ false }
									>
										<Gridicon icon="chevron-down" />
									</Button>
								</div>
							</div>
						</div>
					</>
				}
			>
				<SettingsPaymentsMainChunk />
			</Suspense>
		</>
	);
};

/**
 * Renders the recommended payment methods settings page with a fallback while loading.
 */
export const SettingsPaymentsMethods = () => {
	const location = useLocation();
	const [ paymentMethodsState, setPaymentMethodsState ] = useState< {
		[ key: string ]: boolean;
	} >( {} );
	const [ isCompleted, setIsCompleted ] = useState( false );
	const { providers } = useSelect( ( select ) => {
		return {
			isFetching: select( paymentSettingsStore ).isFetching(),
			providers:
				select( paymentSettingsStore ).getPaymentProviders(
					window.wcSettings?.admin?.poocommerce_payments_nox_profile
						?.business_country_code || null
				) || [],
		};
	}, [] );

	// Retrieve the WooPayments gateway.
	const wooPayments = getWooPaymentsFromProviders( providers );

	const onPaymentMethodsContinueClick = useCallback( () => {
		// Record the event along with payment methods selected.
		recordEvent( 'wcpay_settings_payment_methods_continue', {
			displayed_payment_methods:
				Object.keys( paymentMethodsState ).join( ', ' ),
			selected_payment_methods: Object.keys( paymentMethodsState )
				.filter(
					( paymentMethod ) => paymentMethodsState[ paymentMethod ]
				)
				.join( ', ' ),
			deselected_payment_methods: Object.keys( paymentMethodsState )
				.filter(
					( paymentMethod ) => ! paymentMethodsState[ paymentMethod ]
				)
				.join( ', ' ),
			business_country:
				window.wcSettings?.admin?.poocommerce_payments_nox_profile
					?.business_country_code ?? 'unknown',
		} );

		setIsCompleted( true );

		// Get the onboarding URL or fallback to the test drive account link.
		const onboardUrl =
			wooPayments?.onboarding?._links?.onboard?.href ||
			getWooPaymentsTestDriveAccountLink();

		// Combine the onboard URL with the query string and redirect to the onboard URL.
		window.location.href =
			onboardUrl +
			'&capabilities=' +
			encodeURIComponent( JSON.stringify( paymentMethodsState ) );
	}, [ paymentMethodsState, wooPayments ] );

	useEffect( () => {
		window.scrollTo( 0, 0 ); // Scrolls to the top-left corner of the page.

		if ( location.pathname === '/payment-methods' ) {
			hidePooCommerceNavTab( 'none' );
			recordEvent( 'wcpay_settings_payment_methods_pageview' );
		}
	}, [ location ] );

	return (
		<>
			<div className="poocommerce-layout__header poocommerce-recommended-payment-methods">
				<div className="poocommerce-layout__header-wrapper">
					<BackButton
						href={ getNewPath( {}, '' ) }
						title={ __(
							'Return to payments settings',
							'poocommerce'
						) }
						isRoute={ true }
						from={ 'woopayments_payment_methods' }
					/>
					<h1 className="components-truncate components-text poocommerce-layout__header-heading poocommerce-layout__header-left-align">
						<span className="poocommerce-settings-payments-header__title">
							{ __(
								'Choose your payment methods',
								'poocommerce'
							) }
						</span>
					</h1>
					<Button
						className="components-button is-primary"
						onClick={ onPaymentMethodsContinueClick }
						isBusy={ isCompleted }
						disabled={ isCompleted }
					>
						{ __( 'Continue', 'poocommerce' ) }
					</Button>
					<div className="poocommerce-settings-payments-header__description">
						{ __(
							"Select which payment methods you'd like to offer to your shoppers. You can update these here at any time.",
							'poocommerce'
						) }
					</div>
				</div>
			</div>
			<Suspense
				fallback={
					<>
						<div className="settings-payments-recommended__container">
							<div className="settings-payment-gateways">
								<ListPlaceholder
									rows={ 3 }
									hasDragIcon={ false }
								/>
							</div>
						</div>
					</>
				}
			>
				<SettingsPaymentsMethodsChunk
					paymentMethodsState={ paymentMethodsState }
					setPaymentMethodsState={ setPaymentMethodsState }
				/>
			</Suspense>
		</>
	);
};

/**
 * Wraps the offline payment gateways settings page.
 */
export const SettingsPaymentsOfflineWrapper = () => {
	return (
		<>
			<div className="settings-payments-offline__container">
				<div className="settings-payments-offline__header">
					<BackButton
						href={ getNewPath(
							{ page: 'wc-settings', tab: 'checkout' },
							'/',
							{}
						) }
						title={ __(
							'Return to payments settings',
							'poocommerce'
						) }
						isRoute={ true }
						from={ 'woopayments_payment_methods' }
					/>
					<h1 className="components-truncate components-text poocommerce-layout__header-heading poocommerce-layout__header-left-align">
						<span className="poocommerce-settings-payments-header__title">
							{ __( 'Take offline payments', 'poocommerce' ) }
						</span>
					</h1>
				</div>
				<Suspense fallback={ <ListPlaceholder rows={ 3 } /> }>
					<SettingsPaymentsOfflineChunk />
				</Suspense>
			</div>
		</>
	);
};

/**
 * Wraps the WooPayments settings page.
 */
export const SettingsPaymentsWooPaymentsWrapper = () => {
	return (
		<>
			<Header
				title={ __( 'Settings', 'poocommerce' ) }
				context={ 'wc_settings_payments__woopayments' }
			/>
			<Suspense
				fallback={
					<div>
						{ sprintf(
							/* translators: %s: WooPayments */
							__( 'Loading %s settings…', 'poocommerce' ),
							'WooPayments'
						) }
					</div>
				}
			>
				<SettingsPaymentsWooPaymentsChunk />
			</Suspense>
		</>
	);
};

export const SettingsPaymentsBacsWrapper = () =>
	OfflinePaymentGatewayWrapper( {
		title: __( 'Direct bank transfer', 'poocommerce' ),
		chunkComponent: SettingsPaymentsBacsChunk,
	} );

export const SettingsPaymentsCodWrapper = () =>
	OfflinePaymentGatewayWrapper( {
		title: __( 'Cash on delivery', 'poocommerce' ),
		chunkComponent: SettingsPaymentsCodChunk,
	} );

export const SettingsPaymentsChequeWrapper = () =>
	OfflinePaymentGatewayWrapper( {
		title: __( 'Check payments', 'poocommerce' ),
		chunkComponent: SettingsPaymentsChequeChunk,
	} );

/**
 * Wraps the main payment settings and payment methods settings pages.
 */
export const SettingsPaymentsMainWrapper = () => {
	return (
		<>
			<Header
				title={ __( 'Settings', 'poocommerce' ) }
				context={ 'wc_settings_payments__main' }
			/>
			<HistoryRouter history={ getHistory() }>
				<Routes>
					<Route
						path="/payment-methods"
						element={ <SettingsPaymentsMethods /> }
					/>
					<Route
						path="/offline"
						element={ <SettingsPaymentsOfflineWrapper /> }
					/>
					<Route
						path="/offline/bacs"
						element={ <SettingsPaymentsBacsWrapper /> }
					/>
					<Route
						path="/offline/cod"
						element={ <SettingsPaymentsCodWrapper /> }
					/>
					<Route
						path="/offline/cheque"
						element={ <SettingsPaymentsChequeWrapper /> }
					/>
					<Route path="/*" element={ <SettingsPaymentsMain /> } />
				</Routes>
			</HistoryRouter>
		</>
	);
};
