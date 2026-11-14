/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { VisuallyHidden } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { Text } from '@poocommerce/experimental';
import { getAdminLink } from '@poocommerce/settings';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import './product-recommendations.scss';
import Stack from './stack';
import { MarketplaceSuggestionPlacementType } from './constants';
import { getInAppPurchaseUrl } from '~/lib/in-app-purchase';
import { TrackedLink } from '~/components/tracked-link/tracked-link';

/** An item of the `productsListEmptySuggestions` admin setting. */
export type ProductRecommendation = {
	slug: string;
	product: string;
	title: string;
	copy: string;
	icon: string;
	url: string;
	promoted: string;
};

const CONTEXT = 'products-list-empty-body';
const HEADING_ID = 'poocommerce-product-recommendations-heading';
const BROWSE_ALL_URL = getAdminLink(
	'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=merchandising'
);

const getItemUrl = ( url: string ): string =>
	getInAppPurchaseUrl( url, {
		utm_source: 'productsempty',
		utm_campaign: 'marketplacesuggestions',
		utm_medium: 'product',
	} );

const getTrackProps = ( item: ProductRecommendation, target: string ) => ( {
	suggestion_slug: item.slug,
	context: CONTEXT,
	product: item.product,
	promoted: item.promoted,
	target,
} );

/** Extension recommendations shown on the add-product task when reached from the empty products list. */
export const ProductRecommendations = ( {
	items,
}: {
	items: ProductRecommendation[];
} ) => {
	useEffect( () => {
		items.forEach( ( item ) =>
			recordEvent(
				'marketplace_suggestion_displayed',
				getTrackProps( item, item.url )
			)
		);
	}, [ items ] );

	// The Printful card's class lets feed logos fill the icon slot.
	const stackItems: MarketplaceSuggestionPlacementType[] = items.map(
		( item ) => ( {
			key: item.slug,
			title: item.title,
			content: (
				<>
					{ item.copy }
					<VisuallyHidden as="span">
						{ __( '(opens in a new tab)', 'poocommerce' ) }
					</VisuallyHidden>
				</>
			),
			before: item.icon && (
				<img
					className="poocommerce-product-recommendations__icon"
					src={ item.icon }
					alt=""
					width={ 40 }
					height={ 40 }
				/>
			),
			after: <Icon icon={ external } />,
			className: 'poocommerce-products-list__item-advert',
			onClick: () => {
				recordEvent(
					'marketplace_suggestion_clicked',
					getTrackProps( item, getItemUrl( item.url ) )
				);
				window.open(
					getItemUrl( item.url ),
					'_blank',
					'noopener,noreferrer'
				);
			},
		} )
	);

	return (
		<section
			className="poocommerce-product-recommendations"
			aria-labelledby={ HEADING_ID }
		>
			<div className="poocommerce-product-recommendations__intro">
				<Text
					variant="title"
					as="h3"
					id={ HEADING_ID }
					className="poocommerce-task-products__title"
				>
					{ __(
						'Expand your store with more product options',
						'poocommerce'
					) }
				</Text>
				<Text
					as="p"
					lineHeight="20px"
					className="poocommerce-product-recommendations__description"
				>
					{ __(
						'Discover extensions to do more with your store.',
						'poocommerce'
					) }
				</Text>
			</div>
			<Stack items={ stackItems } showOtherOptions={ false } />
			<TrackedLink
				textProps={ {
					className:
						'poocommerce-product-recommendations__browse-all',
				} }
				message={ __(
					// translators: {{Link}} is a placeholder for a html element.
					'Browse all the extensions. {{Link}}Visit the PooCommerce Marketplace{{/Link}}',
					'poocommerce'
				) }
				eventName="marketplace_suggestion_clicked"
				eventProperties={ {
					suggestion_slug: 'products-empty-footer-browse-all',
					context: 'products-list-empty-footer',
					product: '',
					promoted: 'category-poocommerce-extensions',
					target: BROWSE_ALL_URL,
				} }
				targetUrl={ BROWSE_ALL_URL }
			/>
		</section>
	);
};
