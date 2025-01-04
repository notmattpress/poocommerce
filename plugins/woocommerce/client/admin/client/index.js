/**
 * External dependencies
 */
import '@wordpress/notices';
import { createRoot } from '@wordpress/element';
import { CustomerEffortScoreTracksContainer } from '@poocommerce/customer-effort-score';
import {
	withCurrentUserHydration,
	withSettingsHydration,
} from '@poocommerce/data';
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import { initRemoteLogging } from './lib/init-remote-logging';
// Initialize remote logging early to log any errors that occur during initialization.
initRemoteLogging();

/**
 * Internal dependencies
 */
import './stylesheets/_index.scss';
import { getAdminSetting } from '~/utils/admin-settings';
import { PageLayout } from './layout';
import { renderEmbeddedLayout } from './embedded-body-layout';
import './xstate.js';
import { deriveWpAdminBackgroundColours } from './utils/derive-wp-admin-background-colours';

import {
	SettingsPaymentsMainWrapper,
	SettingsPaymentsOfflineWrapper,
	SettingsPaymentsPooCommercePaymentsWrapper,
} from './settings-payments';
import { ErrorBoundary } from './error-boundary';

const debug = debugFactory( 'wc-admin:client' );
const appRoot = document.getElementById( 'root' );
const embeddedRoot = document.getElementById( 'poocommerce-embedded-root' );
const settingsGroup = 'wc_admin';
const hydrateUser = getAdminSetting( 'currentUserData' );

deriveWpAdminBackgroundColours();

if ( appRoot ) {
	let HydratedPageLayout = withSettingsHydration(
		settingsGroup,
		window.wcSettings.admin
	)( PageLayout );
	const preloadSettings = window.wcSettings.admin
		? window.wcSettings.admin.preloadSettings
		: false;
	const hydrateSettings = preloadSettings && preloadSettings.general;

	if ( hydrateSettings ) {
		HydratedPageLayout = withSettingsHydration( 'general', {
			general: preloadSettings.general,
		} )( HydratedPageLayout );
	}
	if ( hydrateUser ) {
		HydratedPageLayout =
			withCurrentUserHydration( hydrateUser )( HydratedPageLayout );
	}

	createRoot( appRoot ).render(
		<ErrorBoundary>
			<HydratedPageLayout />
		</ErrorBoundary>
	);
} else if ( embeddedRoot ) {
	renderEmbeddedLayout( embeddedRoot, hydrateUser, settingsGroup );
}

// Render the CustomerEffortScoreTracksContainer only if
// the feature flag is enabled.
if (
	window.wcAdminFeatures &&
	window.wcAdminFeatures[ 'customer-effort-score-tracks' ] === true
) {
	// Set up customer effort score survey.
	( function () {
		const root = appRoot || embeddedRoot;
		if ( ! root ) {
			debug( 'Customer Effort Score Tracks root not found' );
			return;
		}

		createRoot(
			root.insertBefore( document.createElement( 'div' ), null )
		).render( <CustomerEffortScoreTracksContainer /> );
	} )();
}

// Render the payment settings components only if
// the feature flag is enabled.
if (
	window.wcAdminFeatures &&
	window.wcAdminFeatures[ 'reactify-classic-payments-settings' ] === true
) {
	( function () {
		const paymentsMainRoot = document.getElementById(
			'experimental_wc_settings_payments_main'
		);
		const paymentsOfflineRoot = document.getElementById(
			'experimental_wc_settings_payments_offline'
		);
		const paymentsPooCommercePaymentsRoot = document.getElementById(
			'experimental_wc_settings_payments_poocommerce_payments'
		);

		if ( paymentsMainRoot ) {
			createRoot(
				paymentsMainRoot.insertBefore(
					document.createElement( 'div' ),
					null
				)
			).render( <SettingsPaymentsMainWrapper /> );
		}

		if ( paymentsOfflineRoot ) {
			createRoot(
				paymentsOfflineRoot.insertBefore(
					document.createElement( 'div' ),
					null
				)
			).render( <SettingsPaymentsOfflineWrapper /> );
		}

		if ( paymentsPooCommercePaymentsRoot ) {
			createRoot(
				paymentsPooCommercePaymentsRoot.insertBefore(
					document.createElement( 'div' ),
					null
				)
			).render( <SettingsPaymentsPooCommercePaymentsWrapper /> );
		}
	} )();
}
