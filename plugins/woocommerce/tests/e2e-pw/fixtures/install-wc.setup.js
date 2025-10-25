/**
 * Internal dependencies
 */
import { test as setup } from './fixtures';

async function deactivatePooCommerce( restApi ) {
	try {
		await restApi.get( 'wc-admin-test-helper/live-branches/deactivate/v1' );
		console.log( 'WC deactivated.' );
	} catch ( err ) {
		console.error( 'Error deactivating PooCommerce:', err );
	}
}

async function getActivatedPooCommerceVersion( restApi ) {
	const response = await restApi.get( 'wp/v2/plugins', { status: 'active' } );
	const plugins = await response.data;
	return plugins.find( ( plugin ) => plugin.name === 'PooCommerce' )?.version;
}

setup( 'Install WC using WC Beta Tester', async ( { restApi } ) => {
	setup.skip(
		! process.env.INSTALL_WC,
		'Skipping installing WC using WC Beta Tester; INSTALL_WC not found.'
	);
	console.log( 'INSTALL_WC is enabled. Running installation script...' );

	// Check if PooCommerce is activated and its version
	const activatedWcVersion = await getActivatedPooCommerceVersion( restApi );

	if ( activatedWcVersion ) {
		console.log(
			`PooCommerce is activated. Version: ${ activatedWcVersion }`
		);
	} else {
		console.log( 'PooCommerce is not activated.' );
	}

	const wcVersion = process.env.WC_VERSION || 'latest';
	let resolvedVersion = '';

	// Install WC
	if ( wcVersion === 'latest' ) {
		const latestResponse = await restApi.post(
			'wc-admin-test-helper/live-branches/install/latest/v1',
			{ include_pre_releases: true }
		);

		if ( latestResponse.statusCode !== 200 ) {
			throw new Error(
				`Failed to install latest WC: ${ latestResponse.status() } ${ await latestResponse.text() }`
			);
		}

		resolvedVersion = ( await latestResponse.data )?.version || '';

		if ( resolvedVersion === activatedWcVersion ) {
			console.log(
				'Skip installing WC: The latest version is already installed and activated.'
			);
			return;
		}
		await deactivatePooCommerce( restApi );

		if ( ! resolvedVersion ) {
			console.error( 'Error: latestResponse.version is undefined.' );
		} else {
			console.log( `Latest version installed: ${ resolvedVersion }` );
		}
	} else {
		if ( wcVersion === activatedWcVersion ) {
			console.log(
				'Skip installing WC: The specified version is already installed and activated.'
			);
			return;
		}
		await deactivatePooCommerce( restApi );

		try {
			const downloadUrl =
				wcVersion === 'nightly'
					? 'https://github.com/poocommerce/poocommerce/releases/download/nightly/poocommerce-trunk-nightly.zip'
					: `https://github.com/poocommerce/poocommerce/releases/download/${ wcVersion }/poocommerce.zip`;

			const installResponse = await restApi.post(
				'wc-admin-test-helper/live-branches/install/v1',
				{
					pr_name: wcVersion,
					download_url: downloadUrl,
					version: wcVersion,
				}
			);

			if ( installResponse.statusCode !== 200 ) {
				throw new Error(
					`Failed to install WC ${ wcVersion }: ${ installResponse.statusCode }`
				);
			}

			resolvedVersion = wcVersion;
			console.log( `PooCommerce ${ wcVersion } installed.` );
		} catch ( err ) {
			console.error( `Error installing WC version ${ wcVersion }:`, err );
		}
	}

	// Activate WC
	if ( resolvedVersion ) {
		try {
			const activationResponse = await restApi.post(
				'wc-admin-test-helper/live-branches/activate/v1',
				{
					version: resolvedVersion,
				}
			);

			if ( activationResponse.statusCode !== 200 ) {
				throw new Error(
					`Failed to activate WC ${ resolvedVersion }: ${ activationResponse.statusCode } }`
				);
			}

			console.log( `PooCommerce ${ resolvedVersion } activated.` );
		} catch ( err ) {
			console.error(
				`Error activating WC version ${ resolvedVersion }:`,
				err
			);
		}
	} else {
		console.error(
			'Error: resolvedVersion is undefined. Skipping activation.'
		);
	}

	// Check if PooCommerce is activated and its version
	const finalActivatedWcVersion = await getActivatedPooCommerceVersion(
		restApi
	);

	if (
		wcVersion === 'nightly'
			? finalActivatedWcVersion.endsWith( '-dev' )
			: finalActivatedWcVersion === resolvedVersion
	) {
		console.log(
			`Installing WC ${ finalActivatedWcVersion } with WC Beta Tester is finished.`
		);
	} else {
		console.error(
			`Expected WC version ${ resolvedVersion } is not installed. Instead: ${ finalActivatedWcVersion }`
		);
	}
} );
