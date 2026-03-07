/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import {
	pluginsStore,
	settingsStore,
	onboardingStore,
} from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { getCountryCode } from '~/dashboard/utils';
import PooCommerceShippingItem from './experimental-poocommerce-shipping-item';
import ShipStationItem from './shipstation-item';
import PacklinkItem from './packlink-item';
import {
	ShippingRecommendationsList,
	useInstallPlugin,
} from './shipping-recommendations';
import './shipping-recommendations.scss';
import { ShippingTour } from '../guided-tours/shipping-tour';

type ExtensionId = 'poocommerce-shipping' | 'shipstation' | 'packlink';

const COUNTRY_EXTENSIONS_MAP: Record< string, ExtensionId[] > = {
	US: [ 'poocommerce-shipping', 'shipstation' ],
	CA: [ 'shipstation' ],
	FR: [ 'packlink' ],
	ES: [ 'packlink' ],
	IT: [ 'packlink' ],
	DE: [ 'shipstation', 'packlink' ],
	GB: [ 'shipstation', 'packlink' ],
	NL: [ 'packlink' ],
	AT: [ 'packlink' ],
	BE: [ 'packlink' ],
	AU: [ 'shipstation' ],
	NZ: [ 'shipstation' ],
};

const EXTENSION_PLUGIN_SLUGS: Record< ExtensionId, string > = {
	'poocommerce-shipping': 'poocommerce-shipping',
	shipstation: 'poocommerce-shipstation-integration',
	packlink: 'packlink-pro-shipping',
};

const ShippingRecommendations = () => {
	const [ pluginsBeingSetup, , handleInstall, handleActivate ] =
		useInstallPlugin();

	const {
		activePlugins,
		installedPlugins,
		countryCode,
		isSellingDigitalProductsOnly,
	} = useSelect( ( select ) => {
		const settings = select( settingsStore ).getSettings( 'general' );

		const { getActivePlugins, getInstalledPlugins } =
			select( pluginsStore );

		const profileItems =
			select( onboardingStore ).getProfileItems().product_types;

		return {
			activePlugins: getActivePlugins(),
			installedPlugins: getInstalledPlugins(),
			countryCode: getCountryCode(
				settings.general?.poocommerce_default_country
			),
			isSellingDigitalProductsOnly:
				profileItems?.length === 1 && profileItems[ 0 ] === 'downloads',
		};
	}, [] );

	const normalizedCountry = countryCode ?? '';

	const extensionsForCountry =
		COUNTRY_EXTENSIONS_MAP[ normalizedCountry ] ?? [];

	const visibleExtensions = isSellingDigitalProductsOnly
		? []
		: extensionsForCountry.filter(
				( ext ) =>
					! activePlugins.includes( EXTENSION_PLUGIN_SLUGS[ ext ] )
		  );

	const visiblePluginSlugs = visibleExtensions
		.map( ( ext ) => EXTENSION_PLUGIN_SLUGS[ ext ] )
		.join( ',' );

	const impressionFired = useRef( false );
	useEffect( () => {
		if ( visibleExtensions.length > 0 && ! impressionFired.current ) {
			recordEvent( 'shipping_partner_impression', {
				context: 'settings',
				country: normalizedCountry,
				plugins: visiblePluginSlugs,
			} );
			impressionFired.current = true;
		}
	}, [ visibleExtensions.length, normalizedCountry, visiblePluginSlugs ] );

	if ( isSellingDigitalProductsOnly ) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	if ( visibleExtensions.length === 0 ) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	return (
		<div style={ { paddingBottom: 60 } }>
			<ShippingTour showShippingRecommendationsStep={ true } />
			<ShippingRecommendationsList>
				{ visibleExtensions.map( ( ext ) => {
					const isPluginInstalled = installedPlugins.includes(
						EXTENSION_PLUGIN_SLUGS[ ext ]
					);
					const trackingProps = {
						context: 'settings' as const,
						country: normalizedCountry,
						plugins: visiblePluginSlugs,
					};
					switch ( ext ) {
						case 'poocommerce-shipping':
							return (
								<PooCommerceShippingItem
									key={ ext }
									isPluginInstalled={ isPluginInstalled }
									pluginsBeingSetup={ pluginsBeingSetup }
									onInstallClick={ handleInstall }
									onActivateClick={ handleActivate }
									tracking={ trackingProps }
								/>
							);
						case 'shipstation':
							return (
								<ShipStationItem
									key={ ext }
									isPluginInstalled={ isPluginInstalled }
									pluginsBeingSetup={ pluginsBeingSetup }
									onInstallClick={ handleInstall }
									onActivateClick={ handleActivate }
									tracking={ trackingProps }
								/>
							);
						case 'packlink':
							return (
								<PacklinkItem
									key={ ext }
									isPluginInstalled={ isPluginInstalled }
									pluginsBeingSetup={ pluginsBeingSetup }
									onInstallClick={ handleInstall }
									onActivateClick={ handleActivate }
									tracking={ trackingProps }
								/>
							);
						default:
							return null;
					}
				} ) }
			</ShippingRecommendationsList>
		</div>
	);
};

export default ShippingRecommendations;
