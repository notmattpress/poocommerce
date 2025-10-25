/**
 * External dependencies
 */
const { get } = require( 'lodash' );
const path = require( 'path' );
const fs = require( 'fs' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );
const ForkTsCheckerWebpackPlugin = require( 'fork-ts-checker-webpack-plugin' );
const ReactRefreshWebpackPlugin = require( '@pmmmwh/react-refresh-webpack-plugin' );

/**
 * Internal dependencies
 */
const CustomTemplatedPathPlugin = require( './bin/custom-templated-path-webpack-plugin' );
const UnminifyWebpackPlugin = require( './bin/unminify-webpack-plugin.js' );
const {
	webpackConfig: styleConfig,
} = require( '@poocommerce/internal-style-build' );
const PooCommerceDependencyExtractionWebpackPlugin = require( '@poocommerce/dependency-extraction-webpack-plugin/src/index' );

const NODE_ENV = process.env.NODE_ENV || 'development';
const WC_ADMIN_PHASE = process.env.WC_ADMIN_PHASE || 'development';
const isHot = Boolean( process.env.HOT );
const isProduction = NODE_ENV === 'production';

const getSubdirectoriesAt = ( searchPath ) => {
	const dir = path.resolve( __dirname, searchPath );
	return fs
		.readdirSync( dir, { withFileTypes: true } )
		.filter( ( entry ) => entry.isDirectory() )
		.map( ( entry ) => entry.name );
};

const WC_ADMIN_PACKAGES_DIR = '../../../../packages/js';
const WP_ADMIN_SCRIPTS_DIR = './client/wp-admin-scripts';

// wpAdminScripts are loaded on wp-admin pages outside the context of PooCommerce Admin
// See ./client/wp-admin-scripts/README.md for more details
const wpAdminScripts = getSubdirectoriesAt( WP_ADMIN_SCRIPTS_DIR ); // automatically include all subdirs
const wcAdminPackages = [
	// we use a whitelist for this instead of dynamically generating it because not all folders are packages meant for consumption
	'admin-layout',
	'components',
	'csv-export',
	'currency',
	'customer-effort-score',
	'date',
	'experimental',
	'explat',
	'navigation',
	'notices',
	'number',
	'data',
	'tracks',
	'onboarding',
	'block-templates',
	'product-editor',
	'sanitize',
	'settings-editor',
	'remote-logging',
	'email-editor',
];

const getEntryPoints = () => {
	const entryPoints = {
		app: './client/index.tsx',
		embed: './client/embed.tsx',
		settings: './client/settings/index.js',
	};
	wcAdminPackages.forEach( ( name ) => {
		entryPoints[ name ] = `${ WC_ADMIN_PACKAGES_DIR }/${ name }`;
	} );
	wpAdminScripts.forEach( ( name ) => {
		entryPoints[ name ] = `${ WP_ADMIN_SCRIPTS_DIR }/${ name }`;
	} );
	return entryPoints;
};

// WordPress.org’s translation infrastructure ignores files named “.min.js” so we need to name our JS files without min when releasing the plugin.
const outputSuffix = WC_ADMIN_PHASE === 'core' ? '' : '.min';

// Here we are patching a dependency, see https://github.com/poocommerce/poocommerce/pull/45548 for more details.
// Should be revisited: using the dependency patching, but seems we need some codebase tweaks as it uses xstate 4/5 mix.
require( 'fs-extra' ).ensureSymlinkSync(
	path.join( __dirname, './node_modules/xstate5' ),
	path.join( __dirname, './node_modules/@xstate5/react/node_modules/xstate' )
);

const webpackConfig = {
	mode: NODE_ENV,
	entry: getEntryPoints(),
	output: {
		filename: ( data ) => {
			// Output wpAdminScripts to wp-admin-scripts folder
			// See https://github.com/poocommerce/poocommerce-admin/pull/3061
			return wpAdminScripts.includes( data.chunk.name )
				? `wp-admin-scripts/[name]${ outputSuffix }.js`
				: `[name]/index${ outputSuffix }.js`;
		},
		chunkFilename: `chunks/[name]${ outputSuffix }.js?ver=[contenthash]`,
		path: path.join( __dirname, '/build' ),
		library: {
			// Expose the exports of entry points so we can consume the libraries in window.wc.[modulename] with PooCommerceDependencyExtractionWebpackPlugin.
			name: [ 'wc', '[modulename]' ],
			type: 'window',
		},
		// A unique name of the webpack build to avoid multiple webpack runtimes to conflict when using globals.
		uniqueName: '__wcAdmin_webpackJsonp',
	},
	module: {
		parser: styleConfig.parser,
		rules: [
			{
				test: /\.(t|j)sx?$/,
				parser: {
					// Disable AMD to fix an issue where underscore and lodash where clashing
					// See https://github.com/poocommerce/poocommerce-admin/pull/1004 and https://github.com/Automattic/poocommerce-services/pull/1522
					amd: false,
				},
				exclude: [
					/[\/\\]node_modules[\/\\]\.pnpm[\/\\]/,
					/[\/\\](changelog|bin|build|docs|test)[\/\\]/,
				],
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@wordpress/babel-preset-default',
							[
								'@babel/preset-env',
								{
									// Add polyfills such as Array.flat based on their usage in the code
									// See https://github.com/poocommerce/poocommerce-admin/pull/6411/
									corejs: '3',
									useBuiltIns: 'usage',
								},
							],
							[ '@babel/preset-typescript' ],
						],
						plugins: [
							! isProduction &&
								isHot &&
								require.resolve( 'react-refresh/babel' ),
							isProduction &&
								require.resolve(
									'babel-plugin-transform-react-remove-prop-types'
								),
						].filter( Boolean ),
						cacheDirectory: path.resolve(
							__dirname,
							'../../../../node_modules/.cache/babel-loader'
						),
						cacheCompression: false,
					},
				},
			},
			{ test: /\.md$/, use: 'raw-loader' },
			{
				test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
				type: 'asset',
			},
			...styleConfig.rules,
		],
	},
	resolve: {
		fallback: {
			// Reduce bundle size by omitting Node crypto library.
			// See https://github.com/poocommerce/poocommerce-admin/pull/5768
			crypto: 'empty',
			// Ignore fs, path to skip resolve errors for @automattic/calypso-config
			fs: false,
			path: false,
		},
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		alias: {
			'~': path.resolve( __dirname + '/client' ),
			'react/jsx-dev-runtime': require.resolve( 'react/jsx-dev-runtime' ),
			'react/jsx-runtime': require.resolve( 'react/jsx-runtime' ),
		},
	},
	plugins: [
		...styleConfig.plugins,
		// Runs TypeScript type checker on a separate process.
		! process.env.STORYBOOK && new ForkTsCheckerWebpackPlugin(),
		new CustomTemplatedPathPlugin( {
			modulename( outputPath, data ) {
				const entryName = get( data, [ 'chunk', 'name' ] );
				if ( entryName ) {
					// Convert the dash-case name to a camel case module name.
					// For example, 'csv-export' -> 'csvExport'
					return entryName.replace( /-([a-z])/g, ( match, letter ) =>
						letter.toUpperCase()
					);
				}
				return outputPath;
			},
		} ),
		// The package build process doesn't handle extracting CSS from JS files, so we copy them separately.
		new CopyWebpackPlugin( {
			patterns: wcAdminPackages.map( ( packageName ) => ( {
				// Copy css and style.asset.php files.
				from: `../../../../packages/js/${ packageName }/build-style/*.{css,php}`,
				to: `./${ packageName }/[name][ext]`,
				noErrorOnMissing: true,
				// Overwrites files already in compilation.assets to ensure we use the assets from the build-style.
				// This is required for @poocommerce/component to use @automattic/* packages because scss styles from @automattic/* packages will be automatically generated by mini-css-extract-plugin with the same output name.
				force: true,
			} ) ),
		} ),

		// Get all product editor blocks so they can be loaded via JSON.
		new CopyWebpackPlugin( {
			patterns: [
				{
					from: path.join(
						__dirname,
						'../../../../packages/js/product-editor/build/blocks'
					),
					to: './product-editor/blocks',
				},
			],
		} ),

		// The email-editor assets for the rich-text.js file need to be copied to the build directory.
		new CopyWebpackPlugin( {
			patterns: [
				{
					from: path.join(
						__dirname,
						'../../../../packages/js/email-editor/assets'
					),
					to: './email-editor/assets',
				},
			],
		} ),

		// React Fast Refresh.
		! isProduction && isHot && new ReactRefreshWebpackPlugin(),

		// We reuse this Webpack setup for Storybook, where we need to disable dependency extraction.
		! process.env.STORYBOOK &&
			new PooCommerceDependencyExtractionWebpackPlugin( {
				requestToExternal( request ) {
					switch ( request ) {
						case 'react/jsx-runtime':
						case 'react/jsx-dev-runtime':
							// @wordpress/dependency-extraction-webpack-plugin version bump related, which added 'react-jsx-runtime' dependency.
							// See https://github.com/WordPress/gutenberg/pull/61692 for more details about the dependency in general.
							// For backward compatibility reasons we need to skip requesting to external here.
							return null;
					}

					if ( request.startsWith( '@wordpress/dataviews' ) ) {
						return null;
					}

					// Skip requesting to external if the import path is from the build or build-module directory for WordPress packages.
					// This is required for @wordpress/edit-site to work and also can reduce the bundle size when we don't need to load the entire WordPress package.
					if (
						request.match( /^@wordpress\/.*\/build(?:-module)?/ )
					) {
						return null;
					}

					// Skip requesting to external if the import path is from the build or build-module directory for PooCommerce packages.
					// This can reduce the bundle size when we don't need to load the entire PooCommerce package.
					if (
						request.match( /^@poocommerce\/.*\/build(?:-module)?/ )
					) {
						return null;
					}
				},
			} ),
		// Reduces data for moment-timezone.
		new MomentTimezoneDataPlugin( {
			// This strips out timezone data before the year 2000 to make a smaller file.
			startYear: 2000,
		} ),
		process.env.ANALYZE && new BundleAnalyzerPlugin(),
		// We only want to generate unminified files in the development phase.
		WC_ADMIN_PHASE === 'development' &&
			// Generate unminified files to load the unminified version when `define( 'SCRIPT_DEBUG', true );` is set in wp-config.
			new UnminifyWebpackPlugin( {
				test: /\.js($|\?)/i,
				mainEntry: 'app/index.min.js',
			} ),
	].filter( Boolean ),
	optimization: {
		minimize: NODE_ENV !== 'development',
		splitChunks: {
			// Not to generate chunk names because it caused a stressful workflow when deploying the plugin to WP.org
			// See https://github.com/poocommerce/poocommerce-admin/pull/5229
			name: false,
		},
	},
};
if ( ! isProduction || WC_ADMIN_PHASE === 'development' ) {
	// Set default sourcemap mode if it wasn't set by WP_DEVTOOL.
	webpackConfig.devtool = webpackConfig.devtool || 'source-map';

	if ( isHot ) {
		// Add dev server config
		// Copied from https://github.com/WordPress/gutenberg/blob/05bea6dd5c6198b0287c41a401d36a06b48831eb/packages/scripts/config/webpack.config.js#L312-L326
		webpackConfig.devServer = {
			devMiddleware: {
				writeToDisk: true,
			},
			allowedHosts: 'auto',
			host: 'localhost',
			port: 8887,
			proxy: {
				'/build': {
					pathRewrite: {
						'^/build': '',
					},
				},
			},
		};
	}
}

module.exports = webpackConfig;
