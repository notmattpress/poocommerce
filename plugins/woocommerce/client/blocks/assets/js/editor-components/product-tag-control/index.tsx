/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { SearchListControl } from '@poocommerce/editor-components/search-list-control';
import { SelectControl } from '@wordpress/components';
import { getSetting } from '@poocommerce/settings';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Internal dependencies
 */
import type { SearchListItem as SearchListItemProps } from '../search-list-control/types';
import ProductTagItem from './product-tag-item';
import type { ProductTagControlProps } from './types';
import { getProductTags } from '../utils';
import './style.scss';

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
		<>
			<SearchListControl
				className="poocommerce-product-tags"
				list={ list }
				isLoading={ loading }
				selected={ selectedTags }
				onChange={ onChange }
				onSearch={ limitTags ? debouncedOnSearch : undefined }
				renderItem={ ProductTagItem }
				messages={ messages }
				isCompact={ isCompact }
				isHierarchical
				isSingle={ false }
			/>
			{ !! onOperatorChange && (
				<div hidden={ selected.length < 2 }>
					<SelectControl
						className="poocommerce-product-tags__operator"
						label={ __(
							'Display products matching',
							'poocommerce'
						) }
						help={ __(
							'Pick at least two tags to use this setting.',
							'poocommerce'
						) }
						value={ operator }
						onChange={ onOperatorChange }
						options={ [
							{
								label: __( 'Any selected tags', 'poocommerce' ),
								value: 'any',
							},
							{
								label: __( 'All selected tags', 'poocommerce' ),
								value: 'all',
							},
						] }
					/>
				</div>
			) }
		</>
	);
};

export default ProductTagControl;
