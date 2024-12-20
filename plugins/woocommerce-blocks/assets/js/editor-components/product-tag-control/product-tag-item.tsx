/**
 * External dependencies
 */
import { _n, sprintf } from '@wordpress/i18n';
import { SearchListItem } from '@poocommerce/editor-components/search-list-control';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import type { RenderItemArgs } from '../search-list-control/types';

export const ProductTagItem = ( {
	item,
	search,
	depth = 0,
	...rest
}: RenderItemArgs ): JSX.Element => {
	const accessibleName = ! item.breadcrumbs.length
		? item.name
		: `${ item.breadcrumbs.join( ', ' ) }, ${ item.name }`;

	return (
		<SearchListItem
			className={ clsx( 'poocommerce-product-tags__item', 'has-count', {
				'is-searching': search.length > 0,
				'is-skip-level': depth === 0 && item.parent !== 0,
			} ) }
			item={ item }
			search={ search }
			depth={ depth }
			{ ...rest }
			ariaLabel={ sprintf(
				/* translators: %1$d is the count of products, %2$s is the name of the tag. */
				_n(
					'%1$d product tagged as %2$s',
					'%1$d products tagged as %2$s',
					item.count,
					'poocommerce'
				),
				item.count,
				accessibleName
			) }
		/>
	);
};

export default ProductTagItem;
