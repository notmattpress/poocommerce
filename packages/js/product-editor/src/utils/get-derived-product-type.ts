/**
 * External dependencies
 */
import { Product } from '@poocommerce/data';

export const getDerivedProductType = ( product: Partial< Product > ) => {
	const hasOptions = !! product.attributes?.find(
		( attribute ) => attribute.options.length && attribute.variation
	);

	if ( hasOptions ) {
		return 'variable';
	}

	return 'simple';
};
