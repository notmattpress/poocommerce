/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { withSearchedCategories } from '@poocommerce/block-hocs';
import ProductTaxonomyControl from '@poocommerce/editor-components/product-taxonomy-control';
import type {
	ProductCategoryResponseItem,
	WithInjectedSearchedCategories,
} from '@poocommerce/types';
import { convertProductCategoryResponseItemToSearchItem } from '@poocommerce/utils';

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
	const list = categories.map(
		convertProductCategoryResponseItemToSearchItem
	);

	return (
		<ProductTaxonomyControl< ProductCategoryResponseItem >
			className="poocommerce-product-categories"
			countType={ showReviewCount ? 'review' : 'product' }
			error={ error }
			isCompact={ isCompact }
			isHierarchical
			isLoading={ isLoading }
			isSingle={ isSingle }
			itemClassName="poocommerce-product-categories__item"
			list={ list }
			messages={ messages }
			onChange={ onChange }
			operator={
				onOperatorChange
					? {
							className:
								'poocommerce-product-categories__operator',
							labels: {
								all: __(
									'All selected categories',
									'poocommerce'
								),
								any: __(
									'Any selected categories',
									'poocommerce'
								),
								help: __(
									'Pick at least two categories to use this setting.',
									'poocommerce'
								),
							},
							onChange: onOperatorChange,
							selectedCount: selected.length,
							value: operator,
						}
					: undefined
			}
			selected={ list.filter( ( { id } ) =>
				selected.includes( Number( id ) )
			) }
		/>
	);
};

export default withSearchedCategories( ProductCategoryControl );
