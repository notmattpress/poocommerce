/**
 * External dependencies
 */
import {
	registerExpressPaymentMethod,
	registerPaymentMethod,
} from '@poocommerce/blocks-registry';
import { __ } from '@wordpress/i18n';
import { getPaymentMethodData, WC_ASSET_URL } from '@poocommerce/settings';
import { decodeEntities } from '@wordpress/html-entities';
import { sanitizeHTML } from '@poocommerce/sanitize';
import { lazy, Suspense, RawHTML } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { PAYMENT_METHOD_NAME } from './constants';

const settings = getPaymentMethodData( 'paypal', {} );

/**
 * Content component
 */
const Content = () => {
	return <RawHTML>{ sanitizeHTML( settings.description || '' ) }</RawHTML>;
};

const paypalPaymentMethod = {
	name: PAYMENT_METHOD_NAME,
	label: (
		<img
			src={ `${ WC_ASSET_URL }/images/paypal.png` }
			alt={ decodeEntities(
				settings.title || __( 'PayPal', 'poocommerce' )
			) }
		/>
	),
	placeOrderButtonLabel: __( 'Proceed to PayPal', 'poocommerce' ),
	content: <Content />,
	edit: <Content />,
	canMakePayment: () => true,
	ariaLabel: decodeEntities(
		settings?.title || __( 'Payment via PayPal', 'poocommerce' )
	),
	supports: {
		features: settings.supports ?? [],
	},
};

registerPaymentMethod( paypalPaymentMethod );

if ( settings.isButtonsEnabled ) {
	// Dynamically import the PayPal wrapper component
	const PayPalButtonsContainer = lazy( () => import( './buttons' ) );
	const LazyPayPalButtonsContainer = () => {
		const options = settings?.buttonsOptions;
		if ( ! options || ! options[ 'client-id' ] ) {
			return null;
		}

		const params = {
			clientId: options[ 'client-id' ],
			merchantId: options[ 'merchant-id' ],
			partnerAttributionId: options[ 'partner-attribution-id' ],
			components: options.components,
			disableFunding: options[ 'disable-funding' ],
			enableFunding: options[ 'enable-funding' ],
			currency: options.currency,
			intent: options.intent,
			pageType: options[ 'page-type' ],
			isProductPage: settings.isProductPage,
			appSwitchRequestOrigin: settings.appSwitchRequestOrigin,
		};

		return (
			<Suspense fallback={ null }>
				<PayPalButtonsContainer { ...params } />
			</Suspense>
		);
	};

	registerExpressPaymentMethod( {
		name: __( 'PayPal', 'poocommerce' ),
		title: __( 'PayPal', 'poocommerce' ),
		description: __( 'PayPal Buttons', 'poocommerce' ),
		gatewayId: 'paypal',
		paymentMethodId: 'paypal',
		content: <LazyPayPalButtonsContainer />,
		edit: <LazyPayPalButtonsContainer />,
		canMakePayment: () => true,
		supports: {
			features: [ 'products' ],
		},
	} );
}
