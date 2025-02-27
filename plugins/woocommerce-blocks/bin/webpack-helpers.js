/* eslint-disable no-console */
/**
 * External dependencies
 */
const path = require( 'path' );
const chalk = require( 'chalk' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const CHECK_CIRCULAR_DEPS = process.env.CHECK_CIRCULAR_DEPS || false;
const ASSET_CHECK = process.env.ASSET_CHECK === 'true';

const wcDepMap = {
	'@poocommerce/blocks-registry': [ 'wc', 'wcBlocksRegistry' ],
	'@poocommerce/settings': [ 'wc', 'wcSettings' ],
	'@poocommerce/block-data': [ 'wc', 'wcBlocksData' ],
	'@poocommerce/data': [ 'wc', 'data' ],
	'@poocommerce/shared-context': [ 'wc', 'wcBlocksSharedContext' ],
	'@poocommerce/shared-hocs': [ 'wc', 'wcBlocksSharedHocs' ],
	'@poocommerce/price-format': [ 'wc', 'priceFormat' ],
	'@poocommerce/blocks-checkout': [ 'wc', 'blocksCheckout' ],
	'@poocommerce/blocks-components': [ 'wc', 'blocksComponents' ],
	'@poocommerce/interactivity': [ 'wc', '__experimentalInteractivity' ],
	'@poocommerce/types': [ 'wc', 'wcTypes' ],
	'@poocommerce/customer-effort-score': [ 'wc', 'customerEffortScore' ],
};

const wcHandleMap = {
	'@poocommerce/blocks-registry': 'wc-blocks-registry',
	'@poocommerce/settings': 'wc-settings',
	'@poocommerce/block-data': 'wc-blocks-data-store',
	'@poocommerce/data': 'wc-store-data',
	'@poocommerce/shared-context': 'wc-blocks-shared-context',
	'@poocommerce/shared-hocs': 'wc-blocks-shared-hocs',
	'@poocommerce/price-format': 'wc-price-format',
	'@poocommerce/blocks-checkout': 'wc-blocks-checkout',
	'@poocommerce/blocks-components': 'wc-blocks-components',
	'@poocommerce/interactivity': 'wc-interactivity',
	'@poocommerce/types': 'wc-types',
	'@poocommerce/customer-effort-score': 'wc-customer-effort-score',
};

const getAlias = ( options = {} ) => {
	let { pathPart } = options;
	pathPart = pathPart ? `${ pathPart }/` : '';
	return {
		'@poocommerce/atomic-blocks': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }atomic/blocks`
		),
		'@poocommerce/atomic-utils': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }atomic/utils`
		),
		'@poocommerce/base-components': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }base/components/`
		),
		'@poocommerce/base-context': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }base/context/`
		),
		'@poocommerce/base-hocs': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }base/hocs/`
		),
		'@poocommerce/base-hooks': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }base/hooks/`
		),
		'@poocommerce/interactivity': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }interactivity/`
		),
		'@poocommerce/base-utils': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }base/utils/`
		),
		'@poocommerce/blocks': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }/blocks`
		),
		'@poocommerce/editor-components': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }editor-components/`
		),
		'@poocommerce/block-hocs': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }hocs`
		),
		'@poocommerce/block-settings': path.resolve(
			__dirname,
			'../assets/js/settings/blocks'
		),
		'@poocommerce/icons': path.resolve( __dirname, `../assets/js/icons` ),
		'@poocommerce/resource-previews': path.resolve(
			__dirname,
			`../assets/js/${ pathPart }previews/`
		),
		'@poocommerce/types': path.resolve( __dirname, `../assets/js/types/` ),
		'@poocommerce/utils': path.resolve( __dirname, `../assets/js/utils/` ),
		'@poocommerce/templates': path.resolve(
			__dirname,
			`../assets/js/templates/`
		),
		'react/jsx-dev-runtime': require.resolve( 'react/jsx-dev-runtime' ),
		'react/jsx-runtime': require.resolve( 'react/jsx-runtime' ),
	};
};

const requestToExternal = ( request ) => {
	if ( wcDepMap[ request ] ) {
		return wcDepMap[ request ];
	}
};

const requestToHandle = ( request ) => {
	if ( wcHandleMap[ request ] ) {
		return wcHandleMap[ request ];
	}
};

const getProgressBarPluginConfig = ( name ) => {
	return {
		format:
			chalk.blue( `Building ${ name }` ) +
			' [:bar] ' +
			chalk.green( ':percent' ) +
			' :msg (:elapsed seconds)',
		summary: false,
		customSummary: ( time ) => {
			console.log(
				chalk.green.bold(
					`${ name } assets build completed (${ time })`
				)
			);
		},
	};
};

const getCacheGroups = () => ( {
	'base-components': {
		test: /\/assets\/js\/base\/components\//,
		name( module, chunks, cacheGroupKey ) {
			const moduleFileName = module
				.identifier()
				.split( '/' )
				.reduceRight( ( item ) => item );
			const allChunksNames = chunks
				.map( ( item ) => item.name )
				.join( '~' );
			return `${ cacheGroupKey }-${ allChunksNames }-${ moduleFileName }`;
		},
	},
	'base-context': {
		test: /\/assets\/js\/base\/context\//,
		name( module, chunks, cacheGroupKey ) {
			const moduleFileName = module
				.identifier()
				.split( '/' )
				.reduceRight( ( item ) => item );
			const allChunksNames = chunks
				.map( ( item ) => item.name )
				.join( '~' );
			return `${ cacheGroupKey }-${ allChunksNames }-${ moduleFileName }`;
		},
	},
	'base-hooks': {
		test: /\/assets\/js\/base\/hooks\//,
		name( module, chunks, cacheGroupKey ) {
			const moduleFileName = module
				.identifier()
				.split( '/' )
				.reduceRight( ( item ) => item );
			const allChunksNames = chunks
				.map( ( item ) => item.name )
				.join( '~' );
			return `${ cacheGroupKey }-${ allChunksNames }-${ moduleFileName }`;
		},
	},
	'base-utils': {
		test: /\/assets\/js\/base\/utils\//,
		name( module, chunks, cacheGroupKey ) {
			const moduleFileName = module
				.identifier()
				.split( '/' )
				.reduceRight( ( item ) => item );
			const allChunksNames = chunks
				.map( ( item ) => item.name )
				.join( '~' );
			return `${ cacheGroupKey }-${ allChunksNames }-${ moduleFileName }`;
		},
	},
} );

module.exports = {
	NODE_ENV,
	CHECK_CIRCULAR_DEPS,
	ASSET_CHECK,
	getAlias,
	requestToHandle,
	requestToExternal,
	getProgressBarPluginConfig,
	getCacheGroups,
};
