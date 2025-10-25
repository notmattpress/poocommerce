const axios = require( 'axios' ).default;
const fs = require( 'fs' );
const path = require( 'path' );
const { wpCLI } = require( './cli' );

/**
 * Encode basic auth username and password to be used in HTTP Authorization header.
 *
 * @param {string} username
 * @param {string} password
 * @return {string} Base64-encoded string
 */
export const encodeCredentials = ( username, password ) => {
	return Buffer.from( `${ username }:${ password }` ).toString( 'base64' );
};

/**
 * Get the download URL of the latest release zip for a plugin using GitHub API.
 *
 * @param {Object}  param
 * @param {string}  param.repository
 * @param {string}  param.authorizationToken
 * @param {boolean} param.prerelease
 * @param {number}  param.perPage
 *
 * @return {string} Download URL for the release zip file.
 */
export const getLatestReleaseZipUrl = async ( {
	repository,
	authorizationToken,
	prerelease = false,
	perPage = 3,
} ) => {
	const requesturl = prerelease
		? `https://api.github.com/repos/${ repository }/releases?per_page=${ perPage }`
		: `https://api.github.com/repos/${ repository }/releases/latest`;

	const options = {
		method: 'get',
		url: requesturl,
		headers: {
			Authorization: authorizationToken
				? `token ${ authorizationToken }`
				: '',
		},
	};

	// Get the first prerelease, or the latest release.
	let response;
	try {
		response = await axios( options );
	} catch ( error ) {
		let errorMessage =
			'Something went wrong when downloading the plugin.\n';

		if ( error.response ) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			errorMessage = errorMessage.concat(
				`Response status: ${ error.response.status } ${ error.response.statusText }`,
				'\n',
				`Response body:`,
				'\n',
				JSON.stringify( error.response.data, null, 2 ),
				'\n'
			);
		} else if ( error.request ) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			errorMessage = errorMessage.concat(
				JSON.stringify( error.request, null, 2 ),
				'\n'
			);
		} else {
			// Something happened in setting up the request that triggered an Error
			errorMessage = errorMessage.concat( error.toJSON(), '\n' );
		}

		throw new Error( errorMessage );
	}

	const release = prerelease
		? // eslint-disable-next-line @typescript-eslint/no-shadow
		  response.data.find( ( { prerelease } ) => prerelease )
		: response.data;

	// If response contains assets, return URL of first asset.
	// Otherwise, return the github.com URL from the tag name.
	const { assets } = release;
	if ( assets && assets.length ) {
		return assets[ 0 ].url;
	}
	const tagName = release.tag_name;
	return `https://github.com/${ repository }/archive/${ tagName }.zip`;
};

/**
 * Deactivate and delete a plugin specified by the given `slug` using the WordPress API.
 *
 * @param {Object}                                params
 * @param {import('@playwright/test').APIRequest} params.request
 * @param {string}                                params.baseURL
 * @param {string}                                params.slug
 * @param {string}                                params.username
 * @param {string}                                params.password
 */
export const deletePlugin = async ( {
	request,
	baseURL,
	slug,
	username,
	password,
} ) => {
	// Check if plugin is installed by getting the list of installed plugins, and then finding the one whose `textdomain` property equals `slug`.
	const apiContext = await request.newContext( {
		baseURL,
		extraHTTPHeaders: {
			Authorization: `Basic ${ encodeCredentials( username, password ) }`,
			cookie: '',
		},
	} );
	const listPluginsResponse = await apiContext.get(
		`/wp-json/wp/v2/plugins`,
		{
			failOnStatusCode: true,
		}
	);
	const pluginsList = await listPluginsResponse.json();
	const pluginToDelete = pluginsList.find(
		( { textdomain } ) => textdomain === slug
	);

	// If installed, get its `plugin` value and use it to deactivate and delete it.
	if ( pluginToDelete ) {
		const { plugin } = pluginToDelete;
		const requestURL = `/wp-json/wp/v2/plugins/${ plugin }`;

		await apiContext.put( requestURL, {
			data: { status: 'inactive' },
		} );

		await apiContext.delete( requestURL );
	}
};

/**
 * Download the zip file from a remote location.
 *
 * @param {Object}  param
 * @param {string}  param.url
 * @param {string}  param.repository
 * @param {string}  param.authorizationToken
 * @param {boolean} param.prerelease
 * @param {string}  param.downloadDir
 *
 * @return {string} Absolute path to the downloaded zip.
 */
export const downloadZip = async ( {
	url,
	repository,
	authorizationToken,
	prerelease = false,
	downloadDir = 'tmp',
} ) => {
	let zipFilename = path.basename( url || repository );
	zipFilename = zipFilename.endsWith( '.zip' )
		? zipFilename
		: zipFilename.concat( '.zip' );
	const zipFilePath = path.resolve( downloadDir, zipFilename );

	// Create destination folder.
	fs.mkdirSync( downloadDir, { recursive: true } );

	const downloadURL =
		url ??
		( await getLatestReleaseZipUrl( {
			repository,
			authorizationToken,
			prerelease,
		} ) );

	// Download the zip.
	const options = {
		method: 'get',
		url: downloadURL,
		responseType: 'stream',
		headers: {
			Authorization: authorizationToken
				? `token ${ authorizationToken }`
				: '',
			Accept: 'application/octet-stream',
		},
	};

	const response = await axios( options ).catch( ( error ) => {
		if ( error.response ) {
			console.error( error.response.data );
		}
		throw new Error( error.message );
	} );

	response.data.pipe( fs.createWriteStream( zipFilePath ) );

	return zipFilePath;
};

/**
 * Delete a zip file. Useful when cleaning up downloaded plugin zips.
 *
 * @param {string} zipFilePath Local file path to the ZIP.
 */
export const deleteZip = async ( zipFilePath ) => {
	await fs.unlink( zipFilePath, ( err ) => {
		if ( err ) throw err;
	} );
};

/**
 * Install a plugin using WP CLI within a WP ENV environment.
 * This is a workaround to the "The uploaded file exceeds the upload_max_filesize directive in php.ini" error encountered when uploading a plugin to the local WP Env E2E environment through the UI.
 *
 * @see https://github.com/WordPress/gutenberg/issues/29430
 *
 * @param {string} pluginPath
 */
export const installPluginThruWpCli = async ( pluginPath ) => {
	const wpEnvPluginPath = pluginPath.replace(
		/.*\/plugins\/poocommerce/,
		'wp-content/plugins/poocommerce'
	);

	await wpCLI( `ls  ${ wpEnvPluginPath }` );

	await wpCLI( `wp plugin install --activate --force ${ wpEnvPluginPath }` );

	await wpCLI( `wp plugin list` );
};
