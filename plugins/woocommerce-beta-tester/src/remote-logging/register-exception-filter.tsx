/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @poocommerce/dependency-group */

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { API_NAMESPACE } from './constants';

/**
 * Retrieves the options for simulating a PooCommerce JavaScript error.
 *
 * @return {Promise<Array|null>} The options if available, null otherwise.
 */
const getSimulateErrorOptions = async () => {
	try {
		const path = `${ API_NAMESPACE }/options?search=wc_beta_tester_simulate_poocommerce_js_error`;

		const options = await apiFetch<
			[
				{
					option_value: string;
					option_name: string;
					option_id: number;
				}
			]
		>( {
			path,
		} );
		return options && options.length > 0 ? options : null;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Error retrieving simulate error options:', error );
		return null;
	}
};

/**
 * Deletes the option used for simulating PooCommerce JavaScript errors.
 */
const deleteSimulateErrorOption = async () => {
	await apiFetch( {
		path: `${ API_NAMESPACE }/options/wc_beta_tester_simulate_poocommerce_js_error`,
		method: 'DELETE',
	} );
};

/**
 * Adds a filter to throw an exception in the PooCommerce core context.
 */
const addCoreExceptionFilter = () => {
	addFilter( 'poocommerce_admin_pages_list', 'wc-beta-tester', () => {
		deleteSimulateErrorOption();

		throw new Error(
			'Test JS exception in WC Core context via WC Beta Tester'
		);
	} );
};

/**
 * Throws an exception specific to the PooCommerce Beta Tester context.
 */
const throwBetaTesterException = () => {
	throw new Error( 'Test JS exception from PooCommerce Beta Tester' );
};

/**
 * Registers an exception filter for simulating JavaScript errors in PooCommerce.
 * This function is used for testing purposes in the PooCommerce Beta Tester plugin.
 */
export const registerExceptionFilter = async () => {
	const options = await getSimulateErrorOptions();
	if ( ! options ) {
		return;
	}

	const context = options[ 0 ].option_value;
	if ( context === 'core' ) {
		addCoreExceptionFilter();
	} else {
		deleteSimulateErrorOption();
		throwBetaTesterException();
	}
};
