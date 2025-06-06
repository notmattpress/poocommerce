import { SimpleProduct } from '@poocommerce/api';
import { Factory } from 'fishery';
import { randomUUID as v4 } from 'crypto';

/**
 * Creates a new factory for creating models.
 *
 * @param {Object} httpClient The HTTP client we will give the repository.
 * @return {Object} The factory for creating models.
 */
export function simpleProductFactory( httpClient ) {
	const repository = SimpleProduct.restRepository( httpClient );
	const defaultProductName = `Simple product ${ v4() }`;
	const defaultRegularPrice = '10.99';

	return Factory.define( ( { params, onCreate } ) => {
		onCreate( ( model ) => {
			return repository.create( model );
		} );

		return {
			name: params.name ? params.name : defaultProductName,
			regularPrice: params.regularPrice
				? params.regularPrice
				: defaultRegularPrice,
		};
	} );
}
