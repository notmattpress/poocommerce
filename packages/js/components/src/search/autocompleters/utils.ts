/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Parse a string suggestion, split apart by where the first matching query is.
 * Used to display matched partial in bold.
 *
 * @param {string} suggestion The item's label as returned from the API.
 * @param {string} query      The search term to match in the string.
 * @return {Object} A list in three parts: before, match, and after.
 */
export function computeSuggestionMatch( suggestion: string, query: string ) {
	if ( ! query ) {
		return null;
	}
	const indexOfMatch = suggestion
		.toLocaleLowerCase()
		.indexOf( query.toLocaleLowerCase() );

	return {
		suggestionBeforeMatch: decodeEntities(
			suggestion.substring( 0, indexOfMatch )
		),
		suggestionMatch: decodeEntities(
			suggestion.substring( indexOfMatch, indexOfMatch + query.length )
		),
		suggestionAfterMatch: decodeEntities(
			suggestion.substring( indexOfMatch + query.length )
		),
	};
}

type Tax = Partial< {
	country: string;
	state: string;
	name: string;
	priority: number;
} >;

export function getTaxCode( tax: Tax ) {
	return [
		tax.country,
		tax.state,
		tax.name || __( 'TAX', 'poocommerce' ),
		tax.priority,
	]
		.filter( Boolean )
		.map( ( item ) => item?.toString().toUpperCase().trim() )
		.join( '-' );
}
