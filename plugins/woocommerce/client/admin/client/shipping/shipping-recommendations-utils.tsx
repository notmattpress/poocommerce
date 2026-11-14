/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useState, Children } from '@wordpress/element';
import { Text } from '@poocommerce/experimental';
import { PluginNames, pluginsStore } from '@poocommerce/data';
import { getAdminLink } from '@poocommerce/settings';
import { CardFooter } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { createNoticesFromResponse } from '../lib/notices';
import {
	DismissableList,
	DismissableListHeading,
} from '../settings-recommendations/dismissable-list';
import { TrackedLink } from '~/components/tracked-link/tracked-link';
import { type DismissState } from '~/hooks/use-option-dismiss';

export const SHIPPING_RECOMMENDATIONS_DISMISS_OPTION =
	'poocommerce_settings_shipping_recommendations_hidden';

type ShippingRecommendationsMarketplaceLinkProps = {
	textProps?: {
		as?: string;
		className?: string;
	};
};

export const useInstallPlugin = () => {
	const [ pluginsBeingSetup, setPluginsBeingSetup ] = useState<
		Array< string >
	>( [] );

	const { installPlugins, activatePlugins } = useDispatch( pluginsStore );

	const handleInstall = ( slugs: string[] ): PromiseLike< void > => {
		if ( pluginsBeingSetup.length > 0 ) {
			return Promise.resolve();
		}

		setPluginsBeingSetup( slugs );

		return installPlugins( slugs as Partial< PluginNames >[] )
			.then( () => {
				setPluginsBeingSetup( [] );
			} )
			.catch( ( response: { errors: Record< string, string > } ) => {
				createNoticesFromResponse( response );
				setPluginsBeingSetup( [] );

				return Promise.reject();
			} );
	};

	const handleActivate = ( slugs: string[] ): PromiseLike< void > => {
		if ( pluginsBeingSetup.length > 0 ) {
			return Promise.resolve();
		}

		setPluginsBeingSetup( slugs );

		return activatePlugins( slugs as Partial< PluginNames >[] )
			.then( () => {
				setPluginsBeingSetup( [] );
			} )
			.catch( ( response: { errors: Record< string, string > } ) => {
				createNoticesFromResponse( response );
				setPluginsBeingSetup( [] );

				return Promise.reject();
			} );
	};

	return [ pluginsBeingSetup, handleInstall, handleActivate ] as const;
};

export const ShippingRecommendationsMarketplaceLink = ( {
	textProps,
}: ShippingRecommendationsMarketplaceLinkProps ) => (
	<TrackedLink
		textProps={ textProps }
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
);

export const ShippingRecommendationsList = ( {
	children,
	dismissState,
}: {
	children: React.ReactNode;
	dismissState: DismissState;
} ) => {
	const { isDismissed, onDismiss } = dismissState;

	return (
		<DismissableList
			className="poocommerce-recommended-shipping-extensions"
			isDismissed={ isDismissed }
		>
			<DismissableListHeading onDismiss={ onDismiss }>
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
						'We recommend adding one of the following shipping extensions to your store.',
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
				<ShippingRecommendationsMarketplaceLink />
			</CardFooter>
		</DismissableList>
	);
};
