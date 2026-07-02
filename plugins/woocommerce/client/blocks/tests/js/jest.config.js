const path = require( 'path' );

const rootDir = path.resolve( __dirname, '../../' );

/**
 * WordPress packages that must resolve to a single instance across the test
 * environment. pnpm 10 isolates transitive deps more strictly than pnpm 9,
 * creating multiple copies of packages that maintain global singleton state
 * (private-APIs lock/unlock, data registries, blocks registry). Forcing them
 * to the workspace copy via `require.resolve` keeps them in sync.
 *
 * Pattern follows @poocommerce/internal-js-tests' `mapWpModules` approach.
 */
const singletonWpModules = [
	'@wordpress/private-apis',
	'@wordpress/block-editor',
	'@wordpress/blocks',
	'@wordpress/components',
	'@wordpress/core-data',
	'@wordpress/data',
	'@wordpress/editor',
	'@wordpress/html-entities',
	'@wordpress/keyboard-shortcuts',
	'@wordpress/patterns',
	'@wordpress/rich-text',
	'@wordpress/notices',
];

const wpSingletonMapper = singletonWpModules.reduce( ( acc, mod ) => {
	try {
		acc[ `^${ mod }$` ] = require.resolve( mod );
	} catch ( e ) {
		// Not a direct dep — skip.
	}
	return acc;
}, {} );

module.exports = {
	rootDir,
	collectCoverageFrom: [
		'assets/js/**/*.js',
		'!**/node_modules/**',
		'!**/vendor/**',
		'!**/test/**',
	],
	moduleDirectories: [ 'node_modules' ],
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$':
			'<rootDir>/tests/js/config/file-mock.js',

		// WordPress singleton modules — bare specifiers only; sub-path
		// imports (e.g. @wordpress/data/build/foo) fall through to normal
		// resolution so they pick up the same physical copy.
		...wpSingletonMapper,
		// core-data sub-path redirects (pre-existing)
		'@wordpress/core-data/build/(.*)$':
			'<rootDir>/node_modules/@wordpress/core-data/build/$1',

		'@poocommerce/atomic-blocks': 'assets/js/atomic/blocks',
		'@poocommerce/atomic-utils': 'assets/js/atomic/utils',
		'@poocommerce/icons': 'assets/js/icons',
		'@poocommerce/settings': 'assets/js/settings/shared',
		'@poocommerce/blocks/(.*)$': 'assets/js/blocks/$1',
		'@poocommerce/block-settings': 'assets/js/settings/blocks',
		'@poocommerce/editor-components(.*)$': 'assets/js/editor-components/$1',
		'@poocommerce/blocks-registry': 'assets/js/blocks-registry',
		'@poocommerce/blocks-checkout$': 'packages/checkout',
		'@poocommerce/blocks-checkout-events': 'assets/js/events',
		'@poocommerce/blocks-components': 'packages/components',
		'@poocommerce/price-format': 'packages/prices',
		'@poocommerce/block-hocs(.*)$': 'assets/js/hocs/$1',
		'@poocommerce/base-components(.*)$': 'assets/js/base/components/$1',
		'@poocommerce/base-context(.*)$': 'assets/js/base/context/$1',
		'@poocommerce/base-hocs(.*)$': 'assets/js/base/hocs/$1',
		'@poocommerce/base-hooks(.*)$': 'assets/js/base/hooks/$1',
		'@poocommerce/base-utils(.*)$': 'assets/js/base/utils',
		'@poocommerce/block-data': 'assets/js/data',
		'@poocommerce/resource-previews': 'assets/js/previews',
		'@poocommerce/shared-context': 'assets/js/shared/context',
		'@poocommerce/shared-hocs': 'assets/js/shared/hocs',
		'@poocommerce/blocks-test-utils/(.*)$': 'tests/utils/$1',
		'@poocommerce/blocks-test-utils': 'tests/utils',
		'@poocommerce/types': 'assets/js/types',
		'@poocommerce/utils': 'assets/js/utils',
		'@poocommerce/test-utils/msw': 'tests/js/config/msw-setup.js',
		'@poocommerce/entities': 'assets/js/entities',
		'@poocommerce/stores/(.*)$': 'assets/js/base/stores/$1',
		'^react$': '<rootDir>/node_modules/react',
		'^react-dom$': '<rootDir>/node_modules/react-dom',
		// Catch-all for monorepo @poocommerce/* packages: route bare and
		// subpath imports through source so tests don't depend on built
		// artifacts. Must come after all blocks-internal aliases above and
		// before the generic build-module rewrite so @poocommerce/* subpaths
		// land on src/ instead of build/.
		'^@poocommerce/([^/]+)/(?:src|build|build-module|build-types)/(.+)$':
			'<rootDir>/../../../../packages/js/$1/src/$2',
		'^@poocommerce/([^/]+)/(.+)$':
			'<rootDir>/../../../../packages/js/$1/src/$2',
		'^@poocommerce/([^/]+)$': '<rootDir>/../../../../packages/js/$1/src',
		'^(.+)/build-module/(.*)$': '$1/build/$2',
	},
	preset: '@wordpress/jest-preset-default',
	setupFiles: [ '<rootDir>/tests/js/config/global-mocks.js' ],
	setupFilesAfterEnv: [
		'<rootDir>/tests/js/config/testing-library.js',
		'<rootDir>/tests/js/config/msw-setup.js',
	],
	testPathIgnorePatterns: [
		'<rootDir>/bin/',
		'<rootDir>/build/',
		'<rootDir>/docs/',
		'<rootDir>/node_modules/',
		'<rootDir>/vendor/',
		'<rootDir>/tests/',
	],
	roots: [ '<rootDir>', '<rootDir>/../legacy/js' ],
	resolver: '<rootDir>/tests/js/scripts/resolver.js',
	transform: {
		'^.+\\.(js|ts|tsx)$': '<rootDir>/tests/js/scripts/babel-transformer.js',
	},
	transformIgnorePatterns: [
		'/node_modules/(?!\\.pnpm/dinero\\.js|dinero\\.js)',
	],
	verbose: true,
	cacheDirectory: '<rootDir>/../../node_modules/.cache/jest',
	testEnvironment: 'jest-fixed-jsdom',
};
