/**
 * External dependencies
 */
import { createContext } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { CurrencyFactory } from './index';

const CURRENCY = getSetting( 'currency' );
const appCurrency = CurrencyFactory( CURRENCY );
export const getFilteredCurrencyInstance = ( query ) => {
	const config = appCurrency.getCurrencyConfig();
	/**
	 * Filter the currency context. This affects all PooCommerce Admin currency formatting.
	 *
	 * @filter poocommerce_admin_report_currency
	 * @param {Object} config Currency configuration.
	 * @param {Object} query  Url query parameters.
	 */
	const filteredConfig = applyFilters(
		'poocommerce_admin_report_currency',
		config,
		query
	);
	return CurrencyFactory( filteredConfig );
};

export const CurrencyContext = createContext(
	appCurrency // default value
);
