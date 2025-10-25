/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

import {
	pluginsStore,
	settingsStore,
	onboardingStore,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { getCountryCode } from '~/dashboard/utils';
import PooCommerceShippingItem from './experimental-poocommerce-shipping-item';
import { ShippingRecommendationsList } from './shipping-recommendations';
import './shipping-recommendations.scss';
import { ShippingTour } from '../guided-tours/shipping-tour';

const ShippingRecommendations = () => {
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

	if ( activePlugins.includes( 'poocommerce-shipping' ) ) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	if ( countryCode !== 'US' || isSellingDigitalProductsOnly ) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	return (
		<>
			<ShippingTour showShippingRecommendationsStep={ true } />
			<ShippingRecommendationsList>
				<PooCommerceShippingItem
					isPluginInstalled={ installedPlugins.includes(
						'poocommerce-shipping'
					) }
				/>
			</ShippingRecommendationsList>
		</>
	);
};

export default ShippingRecommendations;
