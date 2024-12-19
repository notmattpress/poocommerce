/**
 * Internal dependencies
 */
const { merchant, utils } = require( '@poocommerce/e2e-utils' );

const {
	getRemotePluginZip,
	getLatestReleaseZipUrl,
	deleteDownloadedPluginFiles,
} = require( '@poocommerce/e2e-environment' );

/**
 * External dependencies
 */
const { it, beforeAll } = require( '@jest/globals' );

const { UPDATE_WC, TEST_RELEASE } = process.env;

let zipUrl;
const pluginName = 'PooCommerce';

let pluginPath;

utils.describeIf( UPDATE_WC )(
	'PooCommerce plugin can be uploaded and activated',
	() => {
		beforeAll( async () => {
			if ( TEST_RELEASE ) {
				zipUrl = await getLatestReleaseZipUrl(
					'poocommerce/poocommerce'
				);
			} else {
				zipUrl =
					'https://github.com/poocommerce/poocommerce/releases/download/nightly/poocommerce-trunk-nightly.zip';
			}

			pluginPath = await getRemotePluginZip( zipUrl );
			await merchant.login();
		} );

		afterAll( async () => {
			await merchant.logout();
			await deleteDownloadedPluginFiles();
		} );

		it( 'can upload and activate the PooCommerce plugin', async () => {
			await merchant.uploadAndActivatePlugin( pluginPath, pluginName );
		} );

		it( 'can run the database update', async () => {
			// Check for, and run, the database upgrade if needed
			await merchant.runDatabaseUpdate();
		} );

		it( 'can remove downloaded plugin zip', async () => {
			await deleteDownloadedPluginFiles();
		} );
	}
);
