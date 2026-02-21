/**
 * External dependencies
 */
import { Gridicon } from '@automattic/components';
import { Button, Placeholder, SelectControl } from '@wordpress/components';
import React, { lazy, Suspense, useEffect } from '@wordpress/element';
import {
	unstable_HistoryRouter as HistoryRouter,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';
import { getHistory, getNewPath } from '@poocommerce/navigation';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Header } from './components/header/header';
import { BackButton } from './components/buttons/back-button';
import { ListPlaceholder } from '~/settings-payments/components/list-placeholder';
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
	useEffect( () => {
		window.scrollTo( 0, 0 ); // Scrolls to the top of the page.
	}, [] );

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
												'More payment options',
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
 * Wraps the offline payment gateways settings page.
 */
export const SettingsPaymentsOfflineWrapper = () => {
	useEffect( () => {
		window.scrollTo( 0, 0 ); // Scrolls to the top of the page.
	}, [] );

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
