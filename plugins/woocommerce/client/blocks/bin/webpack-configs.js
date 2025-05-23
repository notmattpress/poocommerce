/**
 * External dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );
const { paramCase } = require( 'change-case' );
const RemoveFilesPlugin = require( './remove-files-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const ProgressBarPlugin = require( 'progress-bar-webpack-plugin' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const WebpackRTLPlugin = require( './webpack-rtl-plugin' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

/**
 * Internal dependencies
 */
const { getEntryConfig, genericBlocks } = require( './webpack-entries' );
const {
	ASSET_CHECK,
	NODE_ENV,
	CHECK_CIRCULAR_DEPS,
	requestToExternal,
	requestToHandle,
	getProgressBarPluginConfig,
	getCacheGroups,
} = require( './webpack-helpers' );
const AddSplitChunkDependencies = require( './add-split-chunk-dependencies' );
const { sharedOptimizationConfig } = require( './webpack-shared-config' );

const ROOT_DIR = path.resolve( __dirname, '../../../../../' );
const BUILD_DIR = path.resolve( __dirname, '../build/' );
const BABEL_CACHE_DIR = path.join(
	ROOT_DIR,
	'node_modules/.cache/babel-loader'
);
const isProduction = NODE_ENV === 'production';

/**
 * Shared config for all script builds.
 */
let initialBundleAnalyzerPort = 8888;
const getSharedPlugins = ( {
	bundleAnalyzerReportTitle,
	checkCircularDeps = true,
} ) =>
	[
		CHECK_CIRCULAR_DEPS === 'true' && checkCircularDeps !== false
			? new CircularDependencyPlugin( {
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					cwd: process.cwd(),
					failOnError: 'warn',
			  } )
			: false,
		// The WP_BUNDLE_ANALYZER global variable enables a utility that represents bundle
		// content as a convenient interactive zoomable treemap.
		process.env.WP_BUNDLE_ANALYZER &&
			new BundleAnalyzerPlugin( {
				analyzerPort: initialBundleAnalyzerPort++,
				reportTitle: bundleAnalyzerReportTitle,
			} ),
		new DependencyExtractionWebpackPlugin( {
			injectPolyfill: true,
			combineAssets: ASSET_CHECK,
			outputFormat: ASSET_CHECK ? 'json' : 'php',
			requestToExternal,
			requestToHandle,
		} ),
	].filter( Boolean );

/**
 * Build config for core packages.
 *
 * @param {Object} options Build options.
 */
const getCoreConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;
	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig( 'core', options.exclude || [] ),
		output: {
			filename: ( chunkData ) => {
				return `${ paramCase( chunkData.chunk.name ) }.js`;
			},
			path: BUILD_DIR,
			library: [ 'wc', '[name]' ],
			libraryTarget: 'this',
			uniqueName: 'webpackWcBlocksCoreJsonp',
		},
		module: {
			rules: [
				{
					test: /\.(t|j)sx?$/,
					exclude: [
						/[\/\\](node_modules|build|docs|bin|storybook|tests|test)[\/\\]/,
					],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [ '@wordpress/babel-preset-default' ],
							plugins: [],
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s[c|a]ss$/,
					use: {
						loader: 'ignore-loader',
					},
				},
			],
		},
		plugins: [
			...getSharedPlugins( {
				bundleAnalyzerReportTitle: 'Core',
			} ),
			new ProgressBarPlugin( getProgressBarPluginConfig( 'Core' ) ),
		],
		optimization: {
			...sharedOptimizationConfig,
			splitChunks: {
				automaticNameDelimiter: '--',
				cacheGroups: {
					...getCacheGroups(),
				},
			},
		},
		resolve: {
			...resolve,
			extensions: [ '.js', '.ts', '.tsx' ],
		},
	};
};

/**
 * Build config for Blocks in the editor context.
 *
 * @param {Object} options Build options.
 */
const getMainConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;

	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig( 'main', options.exclude || [] ),
		output: {
			devtoolNamespace: 'wc',
			path: BUILD_DIR,
			// This is a cache busting mechanism which ensures that the script is loaded via the browser with a ?ver=hash
			// string. The hash is based on the built file contents.
			// @see https://github.com/webpack/webpack/issues/2329
			// Using the ?ver string is needed here so the filename does not change between builds. The WordPress
			// i18n system relies on the hash of the filename, so changing that frequently would result in broken
			// translations which we must avoid.
			// @see https://github.com/Automattic/jetpack/pull/20926
			chunkFilename: `[name].js?ver=[contenthash]`,
			filename: `[name].js`,
			library: [ 'wc', 'blocks', '[name]' ],
			libraryTarget: 'this',
			uniqueName: 'webpackWcBlocksMainJsonp',
		},
		module: {
			rules: [
				{
					test: /\.(j|t)sx?$/,
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [ '@wordpress/babel-preset-default' ],
							plugins: [
								isProduction
									? require.resolve(
											'babel-plugin-transform-react-remove-prop-types'
									  )
									: false,
							].filter( Boolean ),
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s[c|a]ss$/,
					use: {
						loader: 'ignore-loader',
					},
				},
			],
		},
		optimization: {
			...sharedOptimizationConfig,
			splitChunks: {
				minSize: 200000,
				automaticNameDelimiter: '--',
				cacheGroups: {
					commons: {
						test: /[\/\\]node_modules[\/\\]/,
						name: 'wc-blocks-vendors',
						chunks: 'all',
						enforce: true,
					},
					...getCacheGroups(),
				},
			},
		},
		plugins: [
			...getSharedPlugins( {
				bundleAnalyzerReportTitle: 'Main',
			} ),
			new ProgressBarPlugin( getProgressBarPluginConfig( 'Main' ) ),
			/**
			 * Ensure that logic of this CopyWebpackPlugin is kept in sync with the copy-block-json.sh script:
			 * https://github.com/poocommerce/poocommerce/blob/7d72fb937907bf841aabe959642be524eb093803/plugins/poocommerce/client/blocks/bin/copy-blocks-json.sh
			 */
			new CopyWebpackPlugin( {
				patterns: [
					{
						from: './assets/js/**/block.json',
						to( { absoluteFilename } ) {
							/**
							 * Getting the block name from the JSON metadata is less error prone
							 * than extracting it from the file path.
							 */
							const JSONFile = fs.readFileSync(
								path.resolve( __dirname, absoluteFilename )
							);
							const metadata = JSON.parse( JSONFile.toString() );
							const blockName = metadata.name
								.split( '/' )
								.at( 1 );

							if (
								metadata.parent &&
								! genericBlocks[ blockName ]
							)
								return `./inner-blocks/${ blockName }/block.json`;
							return `./${ blockName }/block.json`;
						},
					},
				],
			} ),
		],
		resolve: {
			...resolve,
			extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
		},
	};
};

/**
 * Build config for Blocks in the frontend context.
 *
 * @param {Object} options Build options.
 */
const getFrontConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;
	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig( 'frontend', options.exclude || [] ),
		output: {
			devtoolNamespace: 'wc',
			path: BUILD_DIR,
			// This is a cache busting mechanism which ensures that the script is loaded via the browser with a ?ver=hash
			// string. The hash is based on the built file contents.
			// @see https://github.com/webpack/webpack/issues/2329
			// Using the ?ver string is needed here so the filename does not change between builds. The WordPress
			// i18n system relies on the hash of the filename, so changing that frequently would result in broken
			// translations which we must avoid.
			// @see https://github.com/Automattic/jetpack/pull/20926
			chunkFilename: `[name]-frontend.js?ver=[contenthash]`,
			filename: () => {
				return '[name]-frontend.js';
			},
			uniqueName: 'webpackWcBlocksFrontendJsonp',
			library: [ 'wc', '[name]' ],
		},
		module: {
			rules: [
				{
					test: /\.(j|t)sx?$/,
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@wordpress/babel-preset-default',
									{
										modules: false,
										targets: {
											browsers: [
												'extends @wordpress/browserslist-config',
											],
										},
									},
								],
							],
							plugins: [
								isProduction
									? require.resolve(
											'babel-plugin-transform-react-remove-prop-types'
									  )
									: false,
							].filter( Boolean ),
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s[c|a]ss$/,
					use: {
						loader: 'ignore-loader',
					},
				},
			],
		},
		optimization: {
			...sharedOptimizationConfig,
			splitChunks: {
				minSize: 200000,
				automaticNameDelimiter: '--',
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						// Note that filenames are suffixed with `frontend` so the generated file is `wc-blocks-frontend-vendors-frontend`.
						name: 'wc-blocks-frontend-vendors',
						chunks: ( chunk ) => {
							return (
								chunk.name !== 'product-button-interactivity'
							);
						},
						enforce: true,
					},
					...getCacheGroups(),
				},
			},
		},
		plugins: [
			...getSharedPlugins( {
				bundleAnalyzerReportTitle: 'Frontend',
			} ),
			new ProgressBarPlugin( getProgressBarPluginConfig( 'Frontend' ) ),
			new AddSplitChunkDependencies(),
		],
		resolve: {
			...resolve,
			extensions: [ '.js', '.ts', '.tsx' ],
		},
	};
};

/**
 * Build config for built-in payment gateway integrations.
 *
 * @param {Object} options Build options.
 */
const getPaymentsConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;
	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig( 'payments', options.exclude || [] ),
		output: {
			devtoolNamespace: 'wc',
			path: BUILD_DIR,
			filename: `[name].js`,
			uniqueName: 'webpackWcBlocksPaymentMethodExtensionJsonp',
		},
		module: {
			rules: [
				{
					test: /\.(j|t)sx?$/,
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@wordpress/babel-preset-default',
									{
										modules: false,
										targets: {
											browsers: [
												'extends @wordpress/browserslist-config',
											],
										},
									},
								],
							],
							plugins: [
								isProduction
									? require.resolve(
											'babel-plugin-transform-react-remove-prop-types'
									  )
									: false,
							].filter( Boolean ),
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s[c|a]ss$/,
					use: {
						loader: 'ignore-loader',
					},
				},
			],
		},
		optimization: {
			...sharedOptimizationConfig,
			splitChunks: {
				automaticNameDelimiter: '--',
				cacheGroups: {
					...getCacheGroups(),
				},
			},
		},
		plugins: [
			...getSharedPlugins( {
				bundleAnalyzerReportTitle: 'Payment Method Extensions',
			} ),
			new ProgressBarPlugin(
				getProgressBarPluginConfig( 'Payment Method Extensions' )
			),
		],
		resolve: {
			...resolve,
			extensions: [ '.js', '.ts', '.tsx' ],
		},
	};
};

/**
 * Build config for extension integrations.
 *
 * @param {Object} options Build options.
 */
const getExtensionsConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;
	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig( 'extensions', options.exclude || [] ),
		output: {
			devtoolNamespace: 'wc',
			path: BUILD_DIR,
			filename: '[name].js',
			uniqueName: 'webpackWcBlocksExtensionsMethodExtensionJsonp',
		},
		module: {
			rules: [
				{
					test: /\.(j|t)sx?$/,
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@wordpress/babel-preset-default',
									{
										modules: false,
										targets: {
											browsers: [
												'extends @wordpress/browserslist-config',
											],
										},
									},
								],
							],
							plugins: [
								isProduction
									? require.resolve(
											'babel-plugin-transform-react-remove-prop-types'
									  )
									: false,
							].filter( Boolean ),
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s[c|a]ss$/,
					use: {
						loader: 'ignore-loader',
					},
				},
			],
		},
		optimization: {
			...sharedOptimizationConfig,
			splitChunks: {
				automaticNameDelimiter: '--',
				cacheGroups: {
					...getCacheGroups(),
				},
			},
		},
		plugins: [
			...getSharedPlugins( {
				bundleAnalyzerReportTitle: 'Experimental Extensions',
			} ),
			new ProgressBarPlugin(
				getProgressBarPluginConfig( 'Experimental Extensions' )
			),
		],
		resolve: {
			...resolve,
			extensions: [ '.js', '.ts', '.tsx' ],
		},
	};
};

/**
 * Build config for scripts to be used exclusively within the Site Editor context.
 *
 * @param {Object} options Build options.
 */
const getSiteEditorConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;
	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig( 'editor', options.exclude || [] ),
		output: {
			devtoolNamespace: 'wc',
			path: BUILD_DIR,
			filename: `[name].js`,
			chunkLoadingGlobal: 'webpackWcBlocksExtensionsMethodExtensionJsonp',
		},
		module: {
			rules: [
				{
					test: /\.(j|t)sx?$/,
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@wordpress/babel-preset-default',
									{
										modules: false,
										targets: {
											browsers: [
												'extends @wordpress/browserslist-config',
											],
										},
									},
								],
							],
							plugins: [
								isProduction
									? require.resolve(
											'babel-plugin-transform-react-remove-prop-types'
									  )
									: false,
							].filter( Boolean ),
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s[c|a]ss$/,
					use: {
						loader: 'ignore-loader',
					},
				},
			],
		},
		optimization: {
			...sharedOptimizationConfig,
			splitChunks: {
				automaticNameDelimiter: '--',
				cacheGroups: {
					...getCacheGroups(),
				},
			},
		},
		plugins: [
			...getSharedPlugins( {
				bundleAnalyzerReportTitle: 'Site Editor',
			} ),
			new ProgressBarPlugin(
				getProgressBarPluginConfig( 'Site Editor' )
			),
		],
		resolve: {
			...resolve,
			extensions: [ '.js', '.ts', '.tsx' ],
		},
	};
};

/**
 * Build config for CSS Styles.
 *
 * @param {Object} options Build options.
 */
const getStylingConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;

	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig( 'styling', options.exclude || [] ),
		output: {
			devtoolNamespace: 'wc',
			path: BUILD_DIR,
			filename: '[name]-style.js',
			library: [ 'wc', 'blocks', '[name]' ],
			libraryTarget: 'this',
			uniqueName: 'webpackWcBlocksStylingJsonp',
		},
		optimization: {
			splitChunks: {
				automaticNameDelimiter: '--',
				cacheGroups: {
					editorStyle: {
						// Capture all `editor` stylesheets and editor-components stylesheets.
						test: ( module = {}, { moduleGraph } ) => {
							if ( ! module.type.includes( 'css' ) ) {
								return false;
							}

							const moduleIssuer =
								moduleGraph.getIssuer( module );
							if ( ! moduleIssuer ) {
								return false;
							}

							return (
								moduleIssuer.resource.endsWith(
									'editor.scss'
								) ||
								moduleIssuer.resource.includes(
									`${ path.sep }assets${ path.sep }js${ path.sep }editor-components${ path.sep }`
								)
							);
						},
						name: 'wc-blocks-editor-style',
						chunks: 'all',
						priority: 10,
					},
					...getCacheGroups(),
					'base-components': {
						test: /\/assets\/js\/base\/components\//,
						name( module, chunks, cacheGroupKey ) {
							const moduleFileName = module
								.identifier()
								.split( '/' )
								.reduceRight( ( item ) => item )
								.split( '|' )
								.reduce( ( item ) => item );
							const allChunksNames = chunks
								.map( ( item ) => item.name )
								.join( '~' );
							return `${ cacheGroupKey }-${ allChunksNames }-${ moduleFileName }`;
						},
					},
				},
			},
		},
		module: {
			rules: [
				{
					test: /\.(j|t)sx?$/,
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [ '@wordpress/babel-preset-default' ],
							plugins: [
								isProduction
									? require.resolve(
											'babel-plugin-transform-react-remove-prop-types'
									  )
									: false,
							].filter( Boolean ),
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s?css$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						'postcss-loader',
						{
							loader: 'sass-loader',
							options: {
								sassOptions: {
									includePaths: [ 'assets/css/abstracts' ],
								},
								additionalData: ( content, loaderContext ) => {
									const { resourcePath, rootContext } =
										loaderContext;
									const relativePath = path.relative(
										rootContext,
										resourcePath
									);

									if (
										relativePath.startsWith(
											'assets/css/abstracts/'
										) ||
										relativePath.startsWith(
											'assets\\css\\abstracts\\'
										)
									) {
										return content;
									}

									return (
										'@use "sass:math";' +
										'@use "sass:string";' +
										'@use "sass:color";' +
										'@use "sass:map";' +
										'@import "_colors"; ' +
										'@import "_variables"; ' +
										'@import "_breakpoints"; ' +
										'@import "_mixins"; ' +
										content
									);
								},
							},
						},
					],
				},
			],
		},
		plugins: [
			...getSharedPlugins( { bundleAnalyzerReportTitle: 'Styles' } ),
			new ProgressBarPlugin( getProgressBarPluginConfig( 'Styles' ) ),
			new MiniCssExtractPlugin( {
				filename: '[name].css',
			} ),
			new WebpackRTLPlugin( {
				filenameSuffix: '-rtl.css',
			} ),
			// Remove JS files generated by MiniCssExtractPlugin.
			new RemoveFilesPlugin( './build/*style.js' ),
		],
		resolve: {
			...resolve,
			extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
		},
	};
};

const getCartAndCheckoutFrontendConfig = ( options = {} ) => {
	const { alias, resolvePlugins = [] } = options;

	const resolve = alias
		? {
				alias,
				plugins: resolvePlugins,
		  }
		: {
				plugins: resolvePlugins,
		  };
	return {
		entry: getEntryConfig(
			'cartAndCheckoutFrontend',
			options.exclude || []
		),
		output: {
			devtoolNamespace: 'wc',
			path: BUILD_DIR,
			// This is a cache busting mechanism which ensures that the script is loaded via the browser with a ?ver=hash
			// string. The hash is based on the built file contents.
			// @see https://github.com/webpack/webpack/issues/2329
			// Using the ?ver string is needed here so the filename does not change between builds. The WordPress
			// i18n system relies on the hash of the filename, so changing that frequently would result in broken
			// translations which we must avoid.
			// @see https://github.com/Automattic/jetpack/pull/20926
			chunkFilename: '[name]-frontend.js?ver=[contenthash]',
			filename: ( pathData ) => {
				// blocksCheckout and blocksComponents were moved from core bundle,
				// retain their filenames to avoid breaking translations.
				if (
					pathData.chunk.name === 'blocksCheckout' ||
					pathData.chunk.name === 'blocksComponents'
				) {
					return `${ paramCase( pathData.chunk.name ) }.js`;
				}

				return `[name]-frontend.js`;
			},
			uniqueName: 'webpackWcBlocksCartCheckoutFrontendJsonp',
			library: [ 'wc', '[name]' ],
		},
		module: {
			rules: [
				{
					test: /\.(j|t)sx?$/,
					exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@wordpress/babel-preset-default',
									{
										modules: false,
										targets: {
											browsers: [
												'extends @wordpress/browserslist-config',
											],
										},
									},
								],
							],
							plugins: [
								isProduction
									? require.resolve(
											'babel-plugin-transform-react-remove-prop-types'
									  )
									: false,
							].filter( Boolean ),
							cacheDirectory: BABEL_CACHE_DIR,
							cacheCompression: false,
						},
					},
				},
				{
					test: /\.s[c|a]ss$/,
					use: {
						loader: 'ignore-loader',
					},
				},
			],
		},
		optimization: {
			...sharedOptimizationConfig,
			splitChunks: {
				minSize: 200000,
				automaticNameDelimiter: '--',
				cacheGroups: {
					commons: {
						test: /[\\/]node_modules[\\/]/,
						name: 'wc-cart-checkout-vendors',
						chunks: 'all',
						enforce: true,
					},
					base: {
						// A refined include blocks and settings that are shared between cart and checkout that produces the smallest possible bundle.
						test: /assets[\\/]js[\\/](settings|previews|base|data|utils|blocks[\\/]cart-checkout-shared|icons)|packages[\\/](checkout|components)|atomic[\\/]utils/,
						name: 'wc-cart-checkout-base',
						chunks: 'all',
						enforce: true,
					},
					...getCacheGroups(),
				},
			},
		},
		plugins: [
			...getSharedPlugins( {
				bundleAnalyzerReportTitle: 'Cart & Checkout Frontend',
			} ),
			new ProgressBarPlugin(
				getProgressBarPluginConfig( 'Cart & Checkout Frontend' )
			),
			new AddSplitChunkDependencies(),
		],
		resolve: {
			...resolve,
			extensions: [ '.js', '.ts', '.tsx' ],
		},
	};
};

module.exports = {
	getCoreConfig,
	getFrontConfig,
	getMainConfig,
	getPaymentsConfig,
	getExtensionsConfig,
	getSiteEditorConfig,
	getStylingConfig,
	getCartAndCheckoutFrontendConfig,
};
