/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	SearchListControl,
	SearchListItem,
} from '@poocommerce/editor-components/search-list-control';
import { SelectControl } from '@wordpress/components';
import { withSearchedCategories } from '@poocommerce/block-hocs';
import ErrorMessage from '@poocommerce/editor-components/error-placeholder/error-message';
import clsx from 'clsx';
import type { RenderItemArgs } from '@poocommerce/editor-components/search-list-control/types';
import type {
	ProductCategoryResponseItem,
	WithInjectedSearchedCategories,
} from '@poocommerce/types';
import { convertProductCategoryResponseItemToSearchItem } from '@poocommerce/utils';

/**
 * Internal dependencies
 */
import './style.scss';

interface ProductCategoryControlProps {
	/**
	 * Callback to update the selected product categories.
	 */
	onChange: () => void;
	/**
	 * Whether or not the search control should be displayed in a compact way, so it occupies less space.
	 */
	isCompact?: boolean;
	/**
	 * Allow only a single selection. Defaults to false.
	 */
	isSingle?: boolean;
	/**
	 * Callback to update the category operator. If not passed in, setting is not used.
	 */
	onOperatorChange?: () => void;
	/**
	 * Setting for whether products should match all or any selected categories.
	 */
	operator?: 'all' | 'any';
	/**
	 * Whether or not to display the number of reviews for a category in the list.
	 */
	showReviewCount?: boolean;
}

const ProductCategoryControl = ( {
	categories = [],
	error = null,
	isLoading = false,
	onChange,
	onOperatorChange,
	operator = 'any',
	selected,
	isCompact = false,
	isSingle = false,
	showReviewCount,
}: ProductCategoryControlProps & WithInjectedSearchedCategories ) => {
	const renderItem = (
		args: RenderItemArgs< ProductCategoryResponseItem >
	) => {
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
					'poocommerce-product-categories__item',
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
		clear: __( 'Clear all product categories', 'poocommerce' ),
		list: __( 'Product Categories', 'poocommerce' ),
		noItems: __(
			"Your store doesn't have any product categories.",
			'poocommerce'
		),
		search: __( 'Search for product categories', 'poocommerce' ),
		selected: ( n: number ) =>
			sprintf(
				/* translators: %d is the count of selected categories. */
				_n(
					'%d category selected',
					'%d categories selected',
					n,
					'poocommerce'
				),
				n
			),
		updated: __( 'Category search results updated.', 'poocommerce' ),
	};

	if ( error ) {
		return <ErrorMessage error={ error } />;
	}

	const currentList = categories.map(
		convertProductCategoryResponseItemToSearchItem
	);

	return (
		<>
			<SearchListControl
				className="poocommerce-product-categories"
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
						className="poocommerce-product-categories__operator"
						label={ __(
							'Display products matching',
							'poocommerce'
						) }
						help={ __(
							'Pick at least two categories to use this setting.',
							'poocommerce'
						) }
						value={ operator }
						onChange={ onOperatorChange }
						options={ [
							{
								label: __(
									'Any selected categories',
									'poocommerce'
								),
								value: 'any',
							},
							{
								label: __(
									'All selected categories',
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

export default withSearchedCategories( ProductCategoryControl );
