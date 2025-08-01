/**
 * External dependencies
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { useDebounce } from 'use-debounce';
import {
	objectHasProp,
	type WCStoreV1ProductsCollectionProps,
} from '@poocommerce/types';
import { sort } from 'fast-sort';
import { useShallowEqual } from '@poocommerce/base-hooks';

/**
 * Internal dependencies
 */
import { useQueryStateByContext, useQueryStateByKey } from '../use-query-state';
import { useCollection } from './use-collection';
import { useQueryStateContext } from '../../providers/query-state-context';

const buildCollectionDataQuery = (
	collectionDataQueryState: Record< string, unknown >
) => {
	const query = collectionDataQueryState;

	if (
		Array.isArray( collectionDataQueryState.calculate_attribute_counts )
	) {
		query.calculate_attribute_counts = sort(
			collectionDataQueryState.calculate_attribute_counts.map(
				( { taxonomy, queryType } ) => {
					return {
						taxonomy,
						query_type: queryType,
					};
				}
			)
		).asc( [ 'taxonomy', 'query_type' ] );
	}

	if ( Array.isArray( collectionDataQueryState.calculate_taxonomy_counts ) ) {
		query.calculate_taxonomy_counts =
			collectionDataQueryState.calculate_taxonomy_counts;
	}

	return query;
};

interface UseCollectionDataProps {
	queryAttribute?:
		| {
				taxonomy: string;
				queryType: string;
		  }
		| undefined;
	queryTaxonomy?: string | undefined;
	queryPrices?: boolean | undefined;
	queryStock?: boolean | undefined;
	queryRating?: boolean | undefined;
	queryState: Record< string, unknown >;
	isEditor?: boolean;
}

export const useCollectionData = ( {
	queryAttribute,
	queryTaxonomy,
	queryPrices,
	queryStock,
	queryRating,
	queryState,
	isEditor = false,
}: UseCollectionDataProps ) => {
	let context = useQueryStateContext();
	context = `${ context }-collection-data`;

	const [ collectionDataQueryState ] = useQueryStateByContext( context );
	const [ calculateAttributesQueryState, setCalculateAttributesQueryState ] =
		useQueryStateByKey( 'calculate_attribute_counts', [], context );
	const [
		calculateTaxonomyCountsQueryState,
		setCalculateTaxonomyCountsQueryState,
	] = useQueryStateByKey( 'calculate_taxonomy_counts', [], context );
	const [ calculatePriceRangeQueryState, setCalculatePriceRangeQueryState ] =
		useQueryStateByKey( 'calculate_price_range', null, context );
	const [
		calculateStockStatusQueryState,
		setCalculateStockStatusQueryState,
	] = useQueryStateByKey( 'calculate_stock_status_counts', null, context );
	const [ calculateRatingQueryState, setCalculateRatingQueryState ] =
		useQueryStateByKey( 'calculate_rating_counts', null, context );

	const currentQueryAttribute = useShallowEqual( queryAttribute || {} );
	const currentQueryTaxonomy = useShallowEqual( queryTaxonomy );
	const currentQueryPrices = useShallowEqual( queryPrices );
	const currentQueryStock = useShallowEqual( queryStock );
	const currentQueryRating = useShallowEqual( queryRating );

	useEffect( () => {
		if (
			typeof currentQueryAttribute === 'object' &&
			Object.keys( currentQueryAttribute ).length
		) {
			const foundAttribute = calculateAttributesQueryState.find(
				( attribute ) => {
					return (
						objectHasProp( currentQueryAttribute, 'taxonomy' ) &&
						attribute.taxonomy === currentQueryAttribute.taxonomy
					);
				}
			);

			if ( ! foundAttribute ) {
				setCalculateAttributesQueryState( [
					...calculateAttributesQueryState,
					currentQueryAttribute,
				] );
			}
		}
	}, [
		currentQueryAttribute,
		calculateAttributesQueryState,
		setCalculateAttributesQueryState,
	] );

	useEffect( () => {
		if (
			currentQueryTaxonomy &&
			! calculateTaxonomyCountsQueryState.includes( currentQueryTaxonomy )
		) {
			setCalculateTaxonomyCountsQueryState( [
				...calculateTaxonomyCountsQueryState,
				currentQueryTaxonomy,
			] );
		}
	}, [
		currentQueryTaxonomy,
		calculateTaxonomyCountsQueryState,
		setCalculateTaxonomyCountsQueryState,
	] );

	useEffect( () => {
		if (
			calculatePriceRangeQueryState !== currentQueryPrices &&
			currentQueryPrices !== undefined
		) {
			setCalculatePriceRangeQueryState( currentQueryPrices );
		}
	}, [
		currentQueryPrices,
		setCalculatePriceRangeQueryState,
		calculatePriceRangeQueryState,
	] );

	useEffect( () => {
		if (
			calculateStockStatusQueryState !== currentQueryStock &&
			currentQueryStock !== undefined
		) {
			setCalculateStockStatusQueryState( currentQueryStock );
		}
	}, [
		currentQueryStock,
		setCalculateStockStatusQueryState,
		calculateStockStatusQueryState,
	] );

	useEffect( () => {
		if (
			calculateRatingQueryState !== currentQueryRating &&
			currentQueryRating !== undefined
		) {
			setCalculateRatingQueryState( currentQueryRating );
		}
	}, [
		currentQueryRating,
		setCalculateRatingQueryState,
		calculateRatingQueryState,
	] );

	// Defer the select query so all collection-data query vars can be gathered.
	const [ shouldSelect, setShouldSelect ] = useState( isEditor );
	const [ debouncedShouldSelect ] = useDebounce( shouldSelect, 200 );

	if ( ! shouldSelect ) {
		setShouldSelect( true );
	}

	const collectionDataQueryVars = useMemo( () => {
		return buildCollectionDataQuery( collectionDataQueryState );
	}, [ collectionDataQueryState ] );

	const { results, isLoading }: { results: unknown; isLoading: boolean } =
		useCollection( {
			namespace: '/wc/store/v1',
			resourceName: 'products/collection-data',
			query: {
				...queryState,
				page: undefined,
				per_page: undefined,
				orderby: undefined,
				order: undefined,
				...collectionDataQueryVars,
			},
			shouldSelect: debouncedShouldSelect,
		} );

	return { data: results as WCStoreV1ProductsCollectionProps, isLoading };
};
