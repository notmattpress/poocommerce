/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import ProductTaxonomyControl from '@poocommerce/editor-components/product-taxonomy-control';
import { getSetting } from '@poocommerce/settings';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Internal dependencies
 */
import type { SearchListItem as SearchListItemProps } from '../search-list-control/types';
import type { ProductTagControlProps } from './types';
import { getProductTags } from '../utils';

/**
 * Component to handle searching and selecting product tags.
 */
const ProductTagControl = ( {
	isCompact = false,
	onChange,
	onOperatorChange,
	operator = 'any',
	selected,
}: ProductTagControlProps ): JSX.Element => {
	const [ list, setList ] = useState< SearchListItemProps[] >( [] );
	const [ loading, setLoading ] = useState( true );
	const [ isMounted, setIsMounted ] = useState( false );
	const limitTags = getSetting( 'limitTags', false );

	const selectedTags = useMemo< SearchListItemProps[] >( () => {
		return list.filter( ( item ) => selected.includes( item.id ) );
	}, [ list, selected ] );

	const onSearch = useCallback(
		( search: string ) => {
			setLoading( true );
			getProductTags( { selected, search } )
				.then( ( newList ) => {
					setList( newList );
					setLoading( false );
				} )
				.catch( () => {
					setLoading( false );
				} );
		},
		[ selected ]
	);

	// Load on mount.
	useEffect( () => {
		if ( isMounted ) {
			return;
		}
		onSearch( '' );
		setIsMounted( true );
	}, [ onSearch, isMounted ] );

	const debouncedOnSearch = useDebouncedCallback( onSearch, 400 );

	const messages = {
		clear: __( 'Clear all product tags', 'poocommerce' ),
		list: __( 'Product Tags', 'poocommerce' ),
		noItems: __(
			'You have not set up any product tags on your store.',
			'poocommerce'
		),
		search: __( 'Search for product tags', 'poocommerce' ),
		selected: ( n: number ) =>
			sprintf(
				/* translators: %d is the count of selected tags. */
				_n( '%d tag selected', '%d tags selected', n, 'poocommerce' ),
				n
			),
		updated: __( 'Tag search results updated.', 'poocommerce' ),
	};

	return (
		<ProductTaxonomyControl
			className="poocommerce-product-tags"
			isCompact={ isCompact }
			isHierarchical
			isLoading={ loading }
			isSingle={ false }
			itemClassName="poocommerce-product-tags__item"
			list={ list }
			messages={ messages }
			onChange={ onChange }
			onSearch={ limitTags ? debouncedOnSearch : undefined }
			operator={
				onOperatorChange
					? {
							className: 'poocommerce-product-tags__operator',
							labels: {
								all: __( 'All selected tags', 'poocommerce' ),
								any: __( 'Any selected tags', 'poocommerce' ),
								help: __(
									'Pick at least two tags to use this setting.',
									'poocommerce'
								),
							},
							onChange: onOperatorChange,
							selectedCount: selected.length,
							value: operator,
						}
					: undefined
			}
			selected={ selectedTags }
		/>
	);
};

export default ProductTagControl;
