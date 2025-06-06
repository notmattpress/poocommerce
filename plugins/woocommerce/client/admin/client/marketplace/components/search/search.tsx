/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { recordEvent } from '@poocommerce/tracks';
import { navigateTo, getNewPath, useQuery } from '@poocommerce/navigation';
import { SearchControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './search.scss';
import { MARKETPLACE_PATH } from '../constants';

/**
 * Search component.
 *
 * @return {JSX.Element} Search component.
 */
function Search(): JSX.Element {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const searchPlaceholder = __( 'Search Marketplace', 'poocommerce' );

	const query = useQuery();

	useEffect( () => {
		if ( query.term ) {
			setSearchTerm( query.term );
		} else {
			setSearchTerm( '' );
		}
	}, [ query.term ] );

	const runSearch = ( term?: string ) => {
		const newQuery: { term?: string; tab?: string; search?: string } =
			query;

		// If we're on 'Discover' or 'My subscriptions' when a search is initiated, move to the extensions tab
		if ( ! newQuery.tab || newQuery.tab === 'my-subscriptions' ) {
			newQuery.tab = 'extensions';
		}

		newQuery.term = typeof term !== 'undefined' ? term : searchTerm.trim();
		newQuery.search = '1';
		if ( ! newQuery.term ) {
			delete newQuery.term;
		}

		// When the search term changes, we reset the query string on purpose.
		navigateTo( {
			url: getNewPath( newQuery, MARKETPLACE_PATH, {} ),
		} );

		return [];
	};

	const handleKeyUp = ( event: { key: string } ) => {
		if ( event.key === 'Enter' ) {
			runSearch();
		}

		if ( event.key === 'Escape' ) {
			setSearchTerm( '' );
		}
	};

	const onClose = () => {
		setSearchTerm( '' );
		runSearch( '' );
	};

	const onFocus = () => {
		recordEvent( 'marketplace_search_start', {
			current_search_term: searchTerm,
			current_tab: query.tab || 'discover',
		} );
	};

	return (
		<SearchControl
			label={ searchPlaceholder }
			placeholder={ searchPlaceholder }
			value={ searchTerm }
			onChange={ setSearchTerm }
			onKeyUp={ handleKeyUp }
			onClose={ onClose }
			onFocus={ onFocus }
			className="poocommerce-marketplace__search"
		/>
	);
}

export default Search;
