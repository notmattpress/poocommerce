/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';
import type { Options } from 'wordpress__notices';
import { store as coreNoticesStore } from '@wordpress/notices';
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { LOCALE, getAdminSetting } from '../../utils/admin-settings';
import { CategoryAPIItem } from '../components/category-selector/types';
import {
	MARKETPLACE_CART_PATH,
	MARKETPLACE_CATEGORY_API_PATH,
	MARKETPLACE_HOST,
	MARKETPLACE_SEARCH_API_PATH,
	MARKETPLACE_RENEW_SUBSCRIPTON_PATH,
} from '../components/constants';
import { Subscription } from '../components/my-subscriptions/types';
import {
	Product,
	ProductCardType,
	ProductType,
	SearchAPIJSONType,
	SearchAPIProductType,
} from '../components/product-list/types';
import { NoticeStatus } from '../contexts/types';
import { noticeStore } from '../contexts/notice-store';

interface ProductGroup {
	id: string;
	title: string;
	description: string;
	items: Product[];
	url: string;
	url_text: string | null;
	url_type: 'wc-admin' | 'wp-admin' | 'external' | undefined; // types defined by Link component
	itemType: ProductType;
	cardType: ProductCardType;
}

// The fetchCache stores the results of GET fetch/apiFetch calls from the Marketplace, in RAM, for performance
const maxFetchCacheSize = 100;
const fetchCache = new Map();

function maybePruneFetchCache() {
	while ( fetchCache.size > maxFetchCacheSize ) {
		fetchCache.delete( fetchCache.keys().next().value );
	}
}

// Wrapper around apiFetch() that caches results in memory
async function apiFetchWithCache( params: object ): Promise< object > {
	// Attempt to fetch from cache:
	const cacheKey = JSON.stringify( params );
	if ( fetchCache.get( cacheKey ) ) {
		return new Promise( ( resolve ) => {
			resolve( fetchCache.get( cacheKey ) );
		} );
	}

	// Failing that, fetch using apiCache:
	return new Promise( ( resolve, reject ) => {
		apiFetch( params )
			.then( ( json ) => {
				fetchCache.set( cacheKey, json );
				maybePruneFetchCache();
				resolve( json as object );
			} )
			.catch( () => {
				reject();
			} );
	} );
}

// Wrapper around fetch() that caches results in memory
async function fetchJsonWithCache(
	url: string,
	abortSignal?: AbortSignal
): Promise< object > {
	// Attempt to fetch from cache:
	if ( fetchCache.get( url ) ) {
		return new Promise( ( resolve ) => {
			resolve( fetchCache.get( url ) );
		} );
	}

	// Failing that, fetch from net:
	return new Promise( ( resolve, reject ) => {
		fetch( url, { signal: abortSignal } )
			.then( ( response ) => {
				if ( ! response.ok ) {
					throw new Error( response.statusText );
				}
				return response.json();
			} )
			.then( ( json ) => {
				fetchCache.set( url, json );
				maybePruneFetchCache();
				resolve( json );
			} )
			.catch( () => {
				reject();
			} );
	} );
}

// Fetch search results for a given set of URLSearchParams from the PooCommerce.com API
async function fetchSearchResults(
	params: URLSearchParams,
	abortSignal?: AbortSignal
): Promise< {
	products: Product[];
	totalPages: number;
	totalProducts: number;
} > {
	// add user locale to search params if not already present
	if ( LOCALE.userLocale && ! params.get( 'locale' ) ) {
		params.set( 'locale', LOCALE.userLocale );
	}

	const wccomSettings = getAdminSetting( 'wccomHelper', {} );
	params.set( 'connection', wccomSettings.isConnected ? '1' : '0' );

	params.set( 'tracking_allowed', wccomSettings.trackingAllowed ? '1' : '0' );

	const url =
		MARKETPLACE_HOST +
		MARKETPLACE_SEARCH_API_PATH +
		'?' +
		params.toString();

	// Fetch data from WCCOM API
	return new Promise( ( resolve, reject ) => {
		fetchJsonWithCache( url, abortSignal )
			.then( ( json ) => {
				/**
				 * Product card component expects a Product type.
				 * So we build that object from the API response.
				 */
				const products = ( json as SearchAPIJSONType ).products.map(
					( product: SearchAPIProductType ): Product => {
						return {
							id: product.id,
							slug: product.slug,
							title: product.title,
							image: product.image,
							type: product.type,
							freemium_type: product.freemium_type,
							description: product.excerpt,
							vendorName: product.vendor_name,
							vendorUrl: product.vendor_url,
							icon: product.icon,
							url: product.link,
							// Due to backwards compatibility, raw_price is from search API, price is from featured API
							price: product.raw_price ?? product.price,
							regularPrice: product.regular_price,
							isOnSale: product.is_on_sale,
							averageRating: product.rating ?? null,
							reviewsCount: product.reviews_count ?? null,
							isInstallable: product.is_installable,
							featuredImage: product.featured_image,
							productCategory: product.product_category,
							color: product.color,
							billingPeriod: product.billing_period,
							billingPeriodInterval:
								product.billing_period_interval,
							currency: product.currency,
						};
					}
				);
				const totalPages = ( json as SearchAPIJSONType ).total_pages;
				const totalProducts = ( json as SearchAPIJSONType )
					.total_products;
				resolve( { products, totalPages, totalProducts } );
			} )
			.catch( reject );
	} );
}

// Fetch data for the discover page from the PooCommerce.com API
async function fetchDiscoverPageData(): Promise< ProductGroup[] > {
	let url = '/wc/v3/marketplace/featured';

	if ( LOCALE.userLocale ) {
		url = `${ url }?locale=${ LOCALE.userLocale }`;
	}

	try {
		return ( await apiFetchWithCache( {
			path: url.toString(),
		} ) ) as Promise< ProductGroup[] >;
	} catch ( error ) {
		return [];
	}
}

async function fetchProductPreview(
	productId: number
): Promise< { data: { html: string; css: string } } > {
	let url = `/wc/v1/marketplace/product-preview?product_id=${ productId }`;

	if ( LOCALE.userLocale ) {
		url = `${ url }&locale=${ LOCALE.userLocale }`;
	}

	try {
		const response = await apiFetchWithCache( {
			path: url.toString(),
		} );
		return response as { data: { html: string; css: string } };
	} catch ( error ) {
		return { data: { html: '', css: '' } };
	}
}

function getProductType( tab: string ): ProductType {
	switch ( tab ) {
		case 'themes':
			return ProductType.theme;
		case 'business-services':
			return ProductType.businessService;
		default:
			return ProductType.extension;
	}
}

function fetchCategories( type: ProductType ): Promise< CategoryAPIItem[] > {
	const url = new URL( MARKETPLACE_HOST + MARKETPLACE_CATEGORY_API_PATH );

	if ( LOCALE.userLocale ) {
		url.searchParams.set( 'locale', LOCALE.userLocale );
	}

	// We don't define parent for extensions since that is provided by default
	// This is to ensure the old marketplace continues to work when this isn't defined
	if ( type === ProductType.theme ) {
		url.searchParams.set( 'parent', 'themes' );
	} else if ( type === ProductType.businessService ) {
		url.searchParams.set( 'parent', 'business-services' );
	}

	return (
		fetchJsonWithCache( url.toString() ) as Promise< CategoryAPIItem[] >
	 )
		.then( ( json ) => {
			return json;
		} )
		.catch( () => {
			return [];
		} );
}

async function fetchSubscriptions(): Promise< Array< Subscription > > {
	const url = '/wc/v3/marketplace/subscriptions';
	return await apiFetch( { path: url.toString() } );
}

async function refreshSubscriptions(): Promise< Array< Subscription > > {
	const url = '/wc/v3/marketplace/refresh';
	return await apiFetch( {
		path: url.toString(),
		method: 'POST',
	} );
}

function connectProduct( subscription: Subscription ): Promise< void > {
	if ( subscription.active === true ) {
		return Promise.resolve();
	}
	const url = '/wc/v3/marketplace/subscriptions/connect';
	const data = new URLSearchParams();
	data.append( 'product_key', subscription.product_key );
	return apiFetch( {
		path: url.toString(),
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: data,
	} );
}

function activateProductPlugin( subscription: Subscription ): Promise< void > {
	if ( subscription.active === true ) {
		return Promise.resolve();
	}
	const url = '/wc/v3/marketplace/subscriptions/activate-plugin';
	const data = new URLSearchParams();
	data.append( 'product_key', subscription.product_key );
	return apiFetch( {
		path: url.toString(),
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: data,
	} );
}

function disconnectProduct( subscription: Subscription ): Promise< void > {
	if ( subscription.active === false ) {
		return Promise.resolve();
	}
	const url = '/wc/v3/marketplace/subscriptions/disconnect';
	const data = new URLSearchParams();
	data.append( 'product_key', subscription.product_key );
	return apiFetch( {
		path: url.toString(),
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: data,
	} );
}

type WpAjaxReponse = {
	success: boolean;
	data: WpAjaxResponseData;
};

type WpAjaxResponseData = {
	errorMessage?: string;
	activateUrl?: string;
};

function wpAjax(
	action: string,
	data: {
		slug?: string;
		plugin?: string;
		theme?: string;
		success?: boolean;
	}
): Promise< WpAjaxReponse > {
	return new Promise( ( resolve, reject ) => {
		if ( ! window.wp.updates ) {
			reject( __( 'Please reload and try again', 'poocommerce' ) );
			return;
		}

		window.wp.updates.ajax( action, {
			...data,
			success: ( response: WpAjaxResponseData ) => {
				resolve( {
					success: true,
					data: response,
				} );
			},
			error: ( error: WpAjaxResponseData ) => {
				reject( {
					success: false,
					data: {
						message: error.errorMessage,
					},
				} );
			},
		} );
	} );
}

function activateProduct( subscription: Subscription ): Promise< void > {
	if ( subscription.local.active === true ) {
		return Promise.resolve();
	}
	const url = '/wc/v3/marketplace/subscriptions/activate';
	const data = new URLSearchParams();
	data.append( 'product_key', subscription.product_key );
	return apiFetch( {
		path: url.toString(),
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: data,
	} )
		.then( () => Promise.resolve() )
		.catch( () =>
			Promise.reject( {
				success: false,
				data: {
					message: sprintf(
						// translators: %s is the product name.
						__(
							'%s could not be activated. Please activate it manually.',
							'poocommerce'
						),
						subscription.product_name
					),
				},
			} )
		);
}

function getInstallUrl( subscription: Subscription ): Promise< string > {
	return apiFetch( {
		path:
			'/wc/v3/marketplace/subscriptions/install-url?product_key=' +
			subscription.product_key,
	} ).then( ( response ) => {
		return ( response as { data: { url: string } } )?.data.url;
	} );
}

function downloadProduct( productType: string, zipSlug: string ) {
	return wpAjax( 'install-' + productType, {
		// The slug prefix is required for the install to use WCCOM install filters.
		slug: zipSlug,
	} );
}

function installProduct( subscription: Subscription ): Promise< void > {
	return connectProduct( subscription ).then( () => {
		return downloadProduct(
			subscription.product_type,
			subscription.zip_slug
		)
			.then( () => {
				return activateProduct( subscription );
			} )
			.catch( ( error ) => {
				// If install fails disconnect the product
				return disconnectProduct( subscription ).finally( () =>
					Promise.reject( error )
				);
			} );
	} );
}

function updateProduct( subscription: Subscription ): Promise< WpAjaxReponse > {
	return wpAjax( 'update-' + subscription.product_type, {
		slug: subscription.local.slug,
		[ subscription.product_type ]: subscription.local.path,
	} );
}

function addNotice(
	productKey: string,
	message: string,
	status?: NoticeStatus,
	options?: Partial< Options >
) {
	if ( status === NoticeStatus.Error ) {
		dispatch( noticeStore ).addNotice(
			productKey,
			message,
			status,
			options
		);
	} else {
		if ( ! options?.icon ) {
			options = {
				...options,
				icon: <Icon icon="saved" />,
			};
		}

		dispatch( coreNoticesStore ).createSuccessNotice( message, options );
	}
}

const removeNotice = ( productKey: string ) => {
	dispatch( noticeStore ).removeNotice( productKey );
};

const subscriptionToProduct = ( subscription: Subscription ): Product => {
	return {
		id: subscription.product_id,
		title: subscription.product_name,
		image: '',
		type: subscription.product_type as ProductType,
		description: '',
		vendorName: '',
		vendorUrl: '',
		icon: subscription.product_icon,
		url: subscription.product_url,
		price: -1,
		regularPrice: -1,
		isOnSale: false,
		averageRating: null,
		reviewsCount: null,
		isInstallable: false,
		currency: '',
	};
};

// Append UTM parameters to a URL, being aware of existing query parameters
const appendURLParams = (
	url: string,
	utmParams: Array< [ string, string ] >
): string => {
	if ( ! url ) {
		return url;
	}

	const urlObject = new URL( url );
	if ( ! urlObject ) {
		return url;
	}
	utmParams.forEach( ( [ key, value ] ) => {
		urlObject.searchParams.set( key, value );
	} );
	return urlObject.toString();
};

const enableAutorenewalUrl = ( subscription: Subscription ): string => {
	if ( ! subscription.product_key ) {
		// review subscriptions on the Marketplace
		return MARKETPLACE_RENEW_SUBSCRIPTON_PATH;
	}
	return appendURLParams( MARKETPLACE_RENEW_SUBSCRIPTON_PATH, [
		[ 'key', subscription.product_key.toString() ],
	] );
};

const renewUrl = ( subscription: Subscription ): string => {
	return appendURLParams( MARKETPLACE_CART_PATH, [
		[ 'renew_product', subscription.product_id.toString() ],
		[ 'product_key', subscription.product_key ],
		[ 'order_id', subscription.order_id.toString() ],
	] );
};

const subscribeUrl = ( subscription: Subscription ): string => {
	return appendURLParams( MARKETPLACE_CART_PATH, [
		[ 'add-to-cart', subscription.product_id.toString() ],
	] );
};

// If you need to add support for a different page, make sure to
// update WC_Helper::get_source_page() in the backend.
const connectUrl = ( page = 'wc-admin', reconnect = false ): string => {
	const wccomSettings = getAdminSetting( 'wccomHelper', {} );

	if ( ! reconnect && ! wccomSettings.connectURL ) {
		return '';
	} else if ( reconnect && ! wccomSettings.reConnectURL ) {
		return '';
	}

	const url = reconnect
		? wccomSettings.reConnectURL
		: wccomSettings.connectURL;

	// We have to manipulate `page` from the frontend, since `wccomHelper`
	// settings remain static when switching pages on the frontend.
	const updatedHref = new URL( window.location.href );
	updatedHref.searchParams.set( 'page', page );

	return appendURLParams( url, [
		[ 'redirect_admin_url', encodeURIComponent( updatedHref.toString() ) ],
		[ 'page', page ],
	] );
};

export {
	ProductGroup,
	appendURLParams,
	connectProduct,
	activateProductPlugin,
	enableAutorenewalUrl,
	fetchCategories,
	fetchDiscoverPageData,
	fetchSearchResults,
	fetchProductPreview,
	getProductType,
	fetchSubscriptions,
	refreshSubscriptions,
	getInstallUrl,
	downloadProduct,
	activateProduct,
	installProduct,
	updateProduct,
	addNotice,
	removeNotice,
	renewUrl,
	subscribeUrl,
	subscriptionToProduct,
	connectUrl,
};
