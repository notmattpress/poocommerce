/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	SearchListControl,
	SearchListItem,
} from '@poocommerce/editor-components/search-list-control';
import { SelectControl } from '@wordpress/components';
import { withSearchedBrands } from '@poocommerce/block-hocs';
import ErrorMessage from '@poocommerce/editor-components/error-placeholder/error-message';
import clsx from 'clsx';
import type { RenderItemArgs } from '@poocommerce/editor-components/search-list-control/types';
import type {
	ProductBrandResponseItem,
	WithInjectedSearchedBrands,
} from '@poocommerce/types';
import { convertProductBrandResponseItemToSearchItem } from '@poocommerce/utils';

/**
 * Internal dependencies
 */
import './style.scss';
import type { SearchListItem as SearchListItemProps } from '../search-list-control/types';

interface ProductBrandControlProps {
	/**
	 * Callback to update the selected product brands.
	 */
	onChange: ( selected: SearchListItemProps[] ) => void;
	/**
	 * Whether or not the search control should be displayed in a compact way, so it occupies less space.
	 */
	isCompact?: boolean;
	/**
	 * Allow only a single selection. Defaults to false.
	 */
	isSingle?: boolean;
	/**
	 * Callback to update the brand operator. If not passed in, setting is not used.
	 */
	onOperatorChange?: ( operator: string ) => void;
	/**
	 * Setting for whether products should match all or any selected brands.
	 */
	operator?: 'all' | 'any';
	/**
	 * Whether or not to display the number of reviews for a brand in the list.
	 */
	showReviewCount?: boolean;
}

const ProductBrandControl = ( {
	brands = [],
	error = null,
	isLoading = false,
	onChange,
	onOperatorChange,
	operator = 'any',
	selected = [],
	isCompact = false,
	isSingle = false,
	showReviewCount,
}: ProductBrandControlProps & WithInjectedSearchedBrands ) => {
	const renderItem = ( args: RenderItemArgs< ProductBrandResponseItem > ) => {
		const { item, search, depth = 0 } = args;

		const accessibleName = ! item.breadcrumbs.length
			? item.name
			: `${ item.breadcrumbs.join( ', ' ) }, ${ item.name }`;

		const listItemAriaLabel = showReviewCount
			? sprintf(
					/* translators: %1$s is the item name, %2$d is the count of reviews for the item. */
					_n(
						'%1$s, has %2$d review',
						'%1$s, has %2$d reviews',
						item.details?.review_count || 0,
						'poocommerce'
					),
					accessibleName,
					item.details?.review_count || 0
			  )
			: sprintf(
					/* translators: %1$s is the item name, %2$d is the count of products for the item. */
					_n(
						'%1$s, has %2$d product',
						'%1$s, has %2$d products',
						item.details?.count || 0,
						'poocommerce'
					),
					accessibleName,
					item.details?.count || 0
			  );

		const listItemCountLabel = showReviewCount
			? sprintf(
					/* translators: %d is the count of reviews. */
					_n(
						'%d review',
						'%d reviews',
						item.details?.review_count || 0,
						'poocommerce'
					),
					item.details?.review_count || 0
			  )
			: sprintf(
					/* translators: %d is the count of products. */
					_n(
						'%d product',
						'%d products',
						item.details?.count || 0,
						'poocommerce'
					),
					item.details?.count || 0
			  );

		return (
			<SearchListItem
				className={ clsx(
					'poocommerce-product-brands__item',
					'has-count',
					{
						'is-searching': search.length > 0,
						'is-skip-level': depth === 0 && item.parent !== 0,
					}
				) }
				{ ...args }
				countLabel={ listItemCountLabel }
				aria-label={ listItemAriaLabel }
			/>
		);
	};

	const messages = {
		clear: __( 'Clear all product brands', 'poocommerce' ),
		list: __( 'Product Brands', 'poocommerce' ),
		noItems: __(
			"Your store doesn't have any product brands.",
			'poocommerce'
		),
		search: __( 'Search for product brands', 'poocommerce' ),
		selected: ( n: number ) =>
			sprintf(
				/* translators: %d is the count of selected brands. */
				_n(
					'%d brand selected',
					'%d brands selected',
					n,
					'poocommerce'
				),
				n
			),
		updated: __( 'Brand search results updated.', 'poocommerce' ),
	};

	if ( error ) {
		return <ErrorMessage error={ error } />;
	}

	const currentList = brands.map(
		convertProductBrandResponseItemToSearchItem
	);

	return (
		<>
			<SearchListControl
				className="poocommerce-product-brands"
				list={ currentList }
				isLoading={ isLoading }
				selected={ currentList.filter( ( { id } ) =>
					selected.includes( Number( id ) )
				) }
				onChange={ onChange }
				renderItem={ renderItem }
				messages={ messages }
				isCompact={ isCompact }
				isHierarchical
				isSingle={ isSingle }
			/>
			{ !! onOperatorChange && (
				<div hidden={ selected.length < 2 }>
					<SelectControl
						className="poocommerce-product-brands__operator"
						label={ __(
							'Display products matching',
							'poocommerce'
						) }
						help={ __(
							'Pick at least two brands to use this setting.',
							'poocommerce'
						) }
						value={ operator }
						onChange={ onOperatorChange }
						options={ [
							{
								label: __(
									'Any selected brands',
									'poocommerce'
								),
								value: 'any',
							},
							{
								label: __(
									'All selected brands',
									'poocommerce'
								),
								value: 'all',
							},
						] }
					/>
				</div>
			) }
		</>
	);
};

export default withSearchedBrands( ProductBrandControl );
