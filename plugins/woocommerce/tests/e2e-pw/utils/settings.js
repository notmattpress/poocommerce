/**
 * External dependencies
 */
import { createClient, WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { admin } from '../test-data/data';
import playwrightConfig from '../playwright.config';

const apiClient = createClient( playwrightConfig.use.baseURL, {
	type: 'basic',
	username: admin.username,
	password: admin.password,
} );

function resolvePath( path ) {
	return `${ WC_API_PATH }/settings/${ path }`.replace( /\/+/g, '/' );
}

/**
 * Updates the value of a setting at the specified path.
 *
 * @param {string} path         - The API path of the setting to update. E.g. 'settings/general/poocommerce_calc_taxes'.
 * @param {string} desiredValue - The new value to set for the setting. E.g. 'yes'.
 * @return {Promise<void>} A promise that resolves when the update is complete.
 */
export async function updateValue( path, desiredValue ) {
	await apiClient
		.put( resolvePath( path ), { value: desiredValue } )
		.catch( ( err ) => {
			console.error( `Error updating ${ path }` );
			throw err;
		} );
}

/**
 * Updates the value of a setting if it is different from the desired value.
 *
 * @param {string} path         - The API path of the setting to check and update. E.g. 'settings/general/poocommerce_calc_taxes'.
 * @param {string} desiredValue - The desired value to set for the setting. E.g. 'yes'.
 * @return {Promise<{initial: string, updated: string}>} A promise that resolves to an object containing the initial and updated values.
 */
export async function updateIfNeeded( path, desiredValue ) {
	const initialValue = await apiClient
		.get( resolvePath( path ) )
		.then( ( r ) => r.data.value )
		.catch( ( err ) => {
			console.log( `Error checking ${ path }` );
			throw err;
		} );
	if ( initialValue !== desiredValue ) {
		await updateValue( path, desiredValue );
	}
	return { initial: initialValue, updated: desiredValue };
}

/**
 * Resets the value of a setting to its initial value if it was changed.
 *
 * @param {string}                             path   - The API path of the setting to reset. E.g. 'settings/general/poocommerce_calc_taxes'.
 * @param {{initial: string, updated: string}} values - An object containing the initial and updated values of the setting. E.g. { initial: 'no', updated: 'yes' }.
 * @return {Promise<void>} A promise that resolves when the reset is complete.
 */
export async function resetValue( path, values ) {
	if ( values.initial !== values.updated ) {
		await updateValue( path, values.initial );
	}
}
