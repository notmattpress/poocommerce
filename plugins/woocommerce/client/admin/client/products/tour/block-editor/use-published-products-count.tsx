/**
 * External dependencies
 */
import { PRODUCTS_STORE_NAME } from '@poocommerce/data';
import { useSelect } from '@wordpress/data';

const PUBLISHED_PRODUCTS_QUERY_PARAMS = {
	status: 'publish',
	_fields: [ 'id' ],
};

export const usePublishedProductsCount = () => {
	return useSelect( ( select ) => {
		const { getProductsTotalCount, hasFinishedResolution } =
			select( PRODUCTS_STORE_NAME );

		// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
		const publishedProductsCount = getProductsTotalCount(
			PUBLISHED_PRODUCTS_QUERY_PARAMS,
			0
		) as number;

		// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
		const loadingPublishedProductsCount = ! hasFinishedResolution(
			'getProductsTotalCount',
			[ PUBLISHED_PRODUCTS_QUERY_PARAMS, 0 ]
		);

		return {
			publishedProductsCount,
			loadingPublishedProductsCount,
			// we consider a user new if they have no published products
			isNewUser: publishedProductsCount < 1,
		};
	}, [] );
};
