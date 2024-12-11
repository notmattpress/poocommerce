/**
 * External dependencies
 */
import { utils } from '@poocommerce/e2e-utils';
/**
 * Internal dependencies
 */
import { httpClient } from './http-client';
import { deactivateAndDeleteAllPlugins } from './plugins';

const { PLUGIN_NAME } = process.env;

const resetEndpoint = '/poocommerce-reset/v1/state';
const switchLanguageEndpoint = '/poocommerce-reset/v1/switch-language';

const pluginName = PLUGIN_NAME ? PLUGIN_NAME : 'PooCommerce';
const pluginNameSlug = utils.getSlug( pluginName );

const skippedPlugins = [
	'poocommerce',
	'poocommerce-admin',
	'poocommerce-reset',
	'basic-auth',
	'wp-mail-logging',
	'poocommerce-enable-cot',
	pluginNameSlug,
];

export async function resetPooCommerceState() {
	const response = await httpClient.delete( resetEndpoint );
	expect( response.data.options ).toEqual( true );
	expect( response.data.transients ).toEqual( true );
	expect( response.data.notes ).toEqual( true );
	expect( response.statusCode ).toEqual( 200 );
	await deactivateAndDeleteAllPlugins( skippedPlugins );
}

export async function switchLanguage( lang: string ) {
	await httpClient.post( switchLanguageEndpoint, {
		lang,
	} );
}
