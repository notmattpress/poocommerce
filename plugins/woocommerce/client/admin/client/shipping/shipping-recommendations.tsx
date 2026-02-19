/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, Children } from '@wordpress/element';
import { Text } from '@poocommerce/experimental';
import { pluginsStore } from '@poocommerce/data';
import { getAdminLink } from '@poocommerce/settings';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore VisuallyHidden is present, it's just not typed
// eslint-disable-next-line @poocommerce/dependency-group
import { CardFooter } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { createNoticesFromResponse } from '../lib/notices';
import {
	DismissableList,
	DismissableListHeading,
} from '../settings-recommendations/dismissable-list';
import WoocommerceShippingItem from './poocommerce-shipping-item';
import './shipping-recommendations.scss';
import { TrackedLink } from '~/components/tracked-link/tracked-link';

const useInstallPlugin = () => {
	const [ pluginsBeingSetup, setPluginsBeingSetup ] = useState<
		Array< string >
	>( [] );

	const { installAndActivatePlugins } = useDispatch( pluginsStore );

	const handleSetup = ( slugs: string[] ): PromiseLike< void > => {
		if ( pluginsBeingSetup.length > 0 ) {
			return Promise.resolve();
		}

		setPluginsBeingSetup( slugs );

		return installAndActivatePlugins( slugs )
			.then( () => {
				setPluginsBeingSetup( [] );
			} )
			.catch( ( response: { errors: Record< string, string > } ) => {
				createNoticesFromResponse( response );
				setPluginsBeingSetup( [] );

				return Promise.reject();
			} );
	};

	return [ pluginsBeingSetup, handleSetup ] as const;
};

export const ShippingRecommendationsList = ( {
	children,
}: {
	children: React.ReactNode;
} ) => (
	<DismissableList
		className="poocommerce-recommended-shipping-extensions"
		dismissOptionName="poocommerce_settings_shipping_recommendations_hidden"
	>
		<DismissableListHeading>
			<Text variant="title.small" as="p" size="20" lineHeight="28px">
				{ __( 'Recommended shipping solutions', 'poocommerce' ) }
			</Text>
			<Text
				className="poocommerce-recommended-shipping__header-heading"
				variant="caption"
				as="p"
				size="12"
				lineHeight="16px"
			>
				{ __(
					'We recommend adding one of the following shipping extensions to your store. The extension will be installed and activated for you when you click "Get started".',
					'poocommerce'
				) }
			</Text>
		</DismissableListHeading>
		<ul className="poocommerce-list">
			{ Children.map( children, ( item ) => (
				<li className="poocommerce-list__item">{ item }</li>
			) ) }
		</ul>
		<CardFooter>
			<TrackedLink
				message={ __(
					// translators: {{Link}} is a placeholder for a html element.
					'Visit {{Link}}the PooCommerce Marketplace{{/Link}} to find more shipping, delivery, and fulfillment solutions.',
					'poocommerce'
				) }
				targetUrl={ getAdminLink(
					'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=shipping-delivery-and-fulfillment'
				) }
				linkType="wc-admin"
				eventName="settings_shipping_recommendation_visit_marketplace_click"
			/>
		</CardFooter>
	</DismissableList>
);

const ShippingRecommendations = () => {
	const [ pluginsBeingSetup, setupPlugin ] = useInstallPlugin();

	const activePlugins = useSelect(
		( select ) => select( pluginsStore ).getActivePlugins(),
		[]
	);

	if ( activePlugins.includes( 'poocommerce-shipping' ) ) {
		return null;
	}

	return (
		<ShippingRecommendationsList>
			<WoocommerceShippingItem
				pluginsBeingSetup={ pluginsBeingSetup }
				onSetupClick={ setupPlugin }
			/>
		</ShippingRecommendationsList>
	);
};

export default ShippingRecommendations;
