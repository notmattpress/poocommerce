const wcApi = require( '@poocommerce/poocommerce-rest-api' ).default;
const config = require( '../playwright.config' ).default;

let api;

// Ensure that global-setup.js runs before creating api client
if ( process.env.CONSUMER_KEY && process.env.CONSUMER_SECRET ) {
	api = new wcApi( {
		url: config.use.baseURL,
		consumerKey: process.env.CONSUMER_KEY,
		consumerSecret: process.env.CONSUMER_SECRET,
		version: 'wc/v3',
	} );
}

/**
 * Allow explicit construction of api client.
 */
const constructWith = ( consumerKey, consumerSecret ) => {
	api = new wcApi( {
		url: config.use.baseURL,
		consumerKey,
		consumerSecret,
		version: 'wc/v3',
	} );
};

const throwCustomError = (
	error,
	customMessage = 'Something went wrong. See details below.'
) => {
	throw new Error(
		customMessage
			.concat(
				`\nResponse status: ${ error.response.status } ${ error.response.statusText }`
			)
			.concat(
				`\nResponse headers:\n${ JSON.stringify(
					error.response.headers,
					null,
					2
				) }`
			).concat( `\nResponse data:\n${ JSON.stringify(
			error.response.data,
			null,
			2
		) }
` )
	);
};

const update = {
	storeDetails: async ( store ) => {
		await api.post( 'settings/general/batch', {
			update: [
				{
					id: 'poocommerce_store_address',
					value: store.address,
				},
				{
					id: 'poocommerce_store_city',
					value: store.city,
				},
				{
					id: 'poocommerce_default_country',
					value: store.countryCode,
				},
				{
					id: 'poocommerce_store_postcode',
					value: store.zip,
				},
			],
		} );
	},
	enableCashOnDelivery: async () => {
		await api.put( 'payment_gateways/cod', {
			enabled: true,
		} );
	},
	disableCashOnDelivery: async () => {
		await api.put( 'payment_gateways/cod', {
			enabled: false,
		} );
	},
};

const get = {
	coupons: async ( params ) => {
		const response = await api
			.get( 'coupons', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all coupons.'
				);
			} );

		return response.data;
	},
	defaultCountry: async () => {
		const response = await api.get(
			'settings/general/poocommerce_default_country'
		);

		const code = response.data.default;

		return code;
	},
	orders: async ( params ) => {
		const response = await api
			.get( 'orders', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all orders.'
				);
			} );

		return response.data;
	},
	products: async ( params ) => {
		const response = await api
			.get( 'products', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all products.'
				);
			} );

		return response.data;
	},
	productAttributes: async ( params ) => {
		const response = await api
			.get( 'products/attributes', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all product attributes.'
				);
			} );

		return response.data;
	},
	productCategories: async ( params ) => {
		const response = await api
			.get( 'products/categories', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all product categories.'
				);
			} );

		return response.data;
	},
	productTags: async ( params ) => {
		const response = await api
			.get( 'products/tags', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all product tags.'
				);
			} );

		return response.data;
	},
	shippingClasses: async ( params ) => {
		const response = await api
			.get( 'products/shipping_classes', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all shipping classes.'
				);
			} );

		return response.data;
	},

	shippingZones: async ( params ) => {
		const response = await api
			.get( 'shipping/zones', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all shipping zones.'
				);
			} );

		return response.data;
	},
	shippingZoneMethods: async ( shippingZoneId ) => {
		const response = await api
			.get( `shipping/zones/${ shippingZoneId }/methods` )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					`Something went wrong when trying to list all shipping methods in shipping zone ${ shippingZoneId }.`
				);
			} );

		return response.data;
	},
	taxClasses: async () => {
		const response = await api
			.get( 'taxes/classes' )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all tax classes.'
				);
			} );

		return response.data;
	},
	taxRates: async ( params ) => {
		const response = await api
			.get( 'taxes', params )
			.then( ( r ) => r )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when trying to list all tax rates.'
				);
			} );

		return response.data;
	},
};

const create = {
	product: async ( product ) => {
		const response = await api.post( 'products', product );

		return response.data.id;
	},
	shippingZone: async ( zone ) => {
		const response = await api.post( 'shipping/zones', zone );

		return response.data.id;
	},
	shippingMethod: async ( zoneId, method ) => {
		const response = await api.post(
			`shipping/zones/${ zoneId }/methods`,
			method
		);

		return response.data.id;
	},
	/**
	 * Batch create product variations.
	 *
	 * @see {@link [Batch update product variations](https://poocommerce.github.io/poocommerce-rest-api-docs/#batch-update-product-variations)}
	 * @param {number|string} productId  Product ID to add variations to
	 * @param {object[]}      variations Array of variations to add. See [Product variation properties](https://poocommerce.github.io/poocommerce-rest-api-docs/#product-variation-properties)
	 * @return {Promise<number[]>} Array of variation ID's.
	 */
	productVariations: async ( productId, variations ) => {
		const response = await api.post(
			`products/${ productId }/variations/batch`,
			{
				create: variations,
			}
		);

		return response.data.create.map( ( { id } ) => id );
	},
};

const deletePost = {
	coupons: async ( ids ) => {
		const res = await api
			.post( 'coupons/batch', { delete: ids } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting coupons.'
				);
			} );

		return res.data;
	},
	product: async ( id ) => {
		await api.delete( `products/${ id }`, {
			force: true,
		} );
	},
	products: async ( ids ) => {
		const res = await api
			.post( 'products/batch', { delete: ids } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting products.'
				);
			} );
		return res.data;
	},
	productAttributes: async ( id ) => {
		const res = await api
			.post( 'products/attributes/batch', { delete: id } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting product attributes.'
				);
			} );
		return res.data;
	},
	productCategories: async ( ids ) => {
		const res = await api
			.post( 'products/categories/batch', { delete: ids } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting product categories.'
				);
			} );
		return res.data;
	},
	productTags: async ( ids ) => {
		const res = await api
			.post( 'products/tags/batch', { delete: ids } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting product tags.'
				);
			} );
		return res.data;
	},
	order: async ( id ) => {
		await api.delete( `orders/${ id }`, {
			force: true,
		} );
	},
	orders: async ( ids ) => {
		const res = await api
			.post( 'orders/batch', { delete: ids } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting orders.'
				);
			} );
		return res.data;
	},
	shippingClasses: async ( ids ) => {
		const res = await api
			.post( 'products/shipping_classes/batch', { delete: ids } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting shipping classes.'
				);
			} );
		return res.data;
	},
	shippingZone: async ( id ) => {
		const res = await api
			.delete( `shipping/zones/${ id }`, {
				force: true,
			} )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when deleting shipping zone.'
				);
			} );
		return res.data;
	},
	shippingZoneMethod: async ( shippingZoneId, shippingMethodId ) => {
		const res = await api
			.delete(
				`shipping/zones/${ shippingZoneId }/methods/${ shippingMethodId }`,
				{
					force: true,
				}
			)
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when deleting shipping zone method.'
				);
			} );
		return res.data;
	},
	taxClass: async ( slug ) => {
		const res = await api
			.delete( `taxes/classes/${ slug }`, {
				force: true,
			} )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					`Something went wrong when deleting tax class ${ slug }.`
				);
			} );
		return res.data;
	},
	taxRates: async ( ids ) => {
		const res = await api
			.post( 'taxes/batch', { delete: ids } )
			.then( ( response ) => response )
			.catch( ( error ) => {
				throwCustomError(
					error,
					'Something went wrong when batch deleting tax rates.'
				);
			} );
		return res.data;
	},
};

module.exports = {
	update,
	get,
	create,
	deletePost,
	constructWith,
};
