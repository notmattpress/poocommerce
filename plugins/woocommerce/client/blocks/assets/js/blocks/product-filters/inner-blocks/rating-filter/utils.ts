/**
 * External dependencies
 */
import { isString } from '@poocommerce/types';
import { getUrlParameter } from '@poocommerce/utils';

export const getActiveFilters = ( queryParamKey = 'filter_rating' ) => {
	const params = getUrlParameter( queryParamKey );

	if ( ! params ) {
		return [];
	}

	const parsedParams = isString( params )
		? params.split( ',' )
		: ( params as string[] );

	return parsedParams;
};
