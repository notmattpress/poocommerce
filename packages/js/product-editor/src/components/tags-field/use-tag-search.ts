/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import { resolveSelect } from '@wordpress/data';
import {
	EXPERIMENTAL_PRODUCT_TAGS_STORE_NAME,
	ProductTag,
} from '@poocommerce/data';

/**
 * A hook used to handle all the search logic for the tag search component.
 */
export const useTagSearch = () => {
	const [ fetchedTags, setFetchedTags ] = useState< ProductTag[] >( [] );
	const [ isSearching, setIsSearching ] = useState( true );

	const fetchProductTags = ( search?: string ) => {
		setIsSearching( true );
		const query = search !== undefined ? { search } : '';
		resolveSelect( EXPERIMENTAL_PRODUCT_TAGS_STORE_NAME )
			// @ts-expect-error TODO react-18-upgrade: query type is not correctly typed and was surfaced by https://github.com/poocommerce/poocommerce/pull/54146
			.getProductTags( query )
			.then( ( tags: ProductTag[] ) => {
				setFetchedTags( tags );
			} )
			.finally( () => {
				setIsSearching( false );
			} );
	};

	return {
		searchTags: fetchProductTags,
		tagsSelectList: fetchedTags,
		isSearching,
	};
};
