const restrictedImports = [
	{
		name: 'lodash',
		importNames: [
			'camelCase',
			'capitalize',
			'castArray',
			'chunk',
			'clamp',
			'clone',
			'cloneDeep',
			'compact',
			'concat',
			'countBy',
			'debounce',
			'deburr',
			'defaults',
			'defaultTo',
			'delay',
			'difference',
			'differenceWith',
			'dropRight',
			'each',
			'escape',
			'escapeRegExp',
			'every',
			'extend',
			'filter',
			'find',
			'findIndex',
			'findKey',
			'findLast',
			'first',
			'flatMap',
			'flatten',
			'flattenDeep',
			'flow',
			'flowRight',
			'forEach',
			'fromPairs',
			'has',
			'identity',
			'includes',
			'invoke',
			'isArray',
			'isBoolean',
			'isEqual',
			'isFinite',
			'isFunction',
			'isMatch',
			'isNil',
			'isNumber',
			'isObject',
			'isObjectLike',
			'isPlainObject',
			'isString',
			'isUndefined',
			'keyBy',
			'keys',
			'last',
			'lowerCase',
			'map',
			'mapKeys',
			'maxBy',
			'memoize',
			'merge',
			'negate',
			'noop',
			'nth',
			'omit',
			'omitBy',
			'once',
			'orderby',
			'overEvery',
			'partial',
			'partialRight',
			'pick',
			'pickBy',
			'random',
			'reduce',
			'reject',
			'repeat',
			'reverse',
			'setWith',
			'size',
			'snakeCase',
			'some',
			'sortBy',
			'startCase',
			'startsWith',
			'stubFalse',
			'stubTrue',
			'sum',
			'sumBy',
			'take',
			'throttle',
			'times',
			'toString',
			'trim',
			'truncate',
			'unescape',
			'unionBy',
			'uniq',
			'uniqBy',
			'uniqueId',
			'uniqWith',
			'upperFirst',
			'values',
			'without',
			'words',
			'xor',
			'zip',
		],
		message:
			'This Lodash method is not recommended. Please use native functionality instead. If using `memoize`, please use `memize` instead.',
	},
];

const coreModules = [
	'@poocommerce/base-context',
	'@poocommerce/base-components',
	'@poocommerce/base-components/cart-checkout',
	'@poocommerce/block-data',
	'@poocommerce/blocks-checkout',
	'@poocommerce/blocks-checkout-events',
	'@poocommerce/blocks-components',
	'@poocommerce/blocks-registry',
	'@poocommerce/block-settings',
	'@poocommerce/price-format',
	'@poocommerce/settings',
	'@poocommerce/shared-context',
	'@poocommerce/shared-hocs',
	'@poocommerce/stores/store-notices',
	'@poocommerce/stores/poocommerce/cart',
	'@poocommerce/stores/poocommerce/product-data',
	'@poocommerce/tracks',
	'@poocommerce/data',
	'@poocommerce/customer-effort-score',
	'@wordpress/a11y',
	'@wordpress/api-fetch',
	'@wordpress/block-editor',
	'@wordpress/compose',
	'@wordpress/data',
	'@wordpress/core-data',
	'@wordpress/editor',
	'@wordpress/escape-html',
	'@wordpress/hooks',
	'@wordpress/keycodes',
	'@wordpress/url',
	'@wordpress/wordcount',
	'@poocommerce/blocks-test-utils',
	'babel-jest',
	'dotenv',
	'lodash/kebabCase',
	'lodash',
	'prop-types',
	'react',
	'requireindex',
	'react-transition-group',
];

module.exports = {
	env: {
		browser: true,
		jest: true,
	},
	root: true,
	extends: [
		'plugin:@poocommerce/eslint-plugin/recommended',
		'plugin:you-dont-need-lodash-underscore/compatible',
		'plugin:storybook/recommended',
	],
	globals: {
		wcBlocksMiddlewareConfig: 'readonly',
		fetchMock: true,
		jQuery: 'readonly',
		IntersectionObserver: 'readonly',
		// @todo Move E2E related ESLint configuration into custom config.
		//
		// We should have linting properties only included for files that they
		// are specific to as opposed to globally.
		page: 'readonly',
		browser: 'readonly',
		context: 'readonly',
	},
	settings: {
		jsdoc: { mode: 'typescript' },
		// List of modules that are externals in our webpack config.
		// This helps the `import/no-extraneous-dependencies` and
		//`import/no-unresolved` rules account for them.
		'import/core-modules': coreModules,
		'import/resolver': {
			node: {},
			webpack: {},
			typescript: {},
		},
	},
	rules: {
		'poocommerce/feature-flag': 'off',
		'react-hooks/exhaustive-deps': 'error',
		'react/jsx-fragments': [ 'error', 'syntax' ],
		'@wordpress/no-global-active-element': 'warn',
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: [ 'poocommerce' ],
			},
		],
		'no-restricted-imports': [
			'error',
			{
				paths: restrictedImports,
			},
		],
		'@typescript-eslint/no-restricted-imports': [
			'error',
			{
				paths: [
					{
						name: 'react',
						message:
							'Please use React API through `@wordpress/element` instead.',
						allowTypeImports: true,
					},
				],
			},
		],
		camelcase: [
			'error',
			{
				properties: 'never',
				ignoreGlobals: true,
			},
		],
		'react/react-in-jsx-scope': 'off',
	},
	overrides: [
		{
			files: [ '**/tests/e2e-jest/**' ],
			rules: {
				'jest/no-disabled-tests': 'off',
			},
		},
		{
			files: [ '**/bin/**.js', '**/storybook/**.js', '**/stories/**.js' ],
			rules: {
				'you-dont-need-lodash-underscore/omit': 'off',
			},
		},
		{
			files: [
				'assets/js/**/test/**/*.{js,jsx,ts,tsx}',
				'assets/js/**/*.test.{js,jsx,ts,tsx}',
			],
			parser: '@typescript-eslint/parser',
			plugins: [ 'jest', '@typescript-eslint' ],
			extends: [ 'plugin:jest/recommended' ],
			rules: {
				'jest/no-mocks-import': 'off',
				// With React Testing library, it is expected use expect() in the waitFor() function: https://testing-library.com/docs/dom-testing-library/api-async/
				'jest/no-standalone-expect': 'off',
			},
		},
		{
			files: [ '*.ts', '*.tsx' ],
			excludedFiles: [
				'assets/js/**/test/**/*.{js,jsx,ts,tsx}',
				'assets/js/**/*.test.{js,jsx,ts,tsx}',
			],
			parser: '@typescript-eslint/parser',
			extends: [
				'plugin:@poocommerce/eslint-plugin/recommended',
				'plugin:you-dont-need-lodash-underscore/compatible',
				'plugin:@typescript-eslint/recommended',
				'plugin:import/errors',
			],
			rules: {
				'@typescript-eslint/no-explicit-any': 'error',
				'no-use-before-define': 'off',
				'@typescript-eslint/no-use-before-define': [ 'error' ],
				'jsdoc/require-param': 'off',
				'no-shadow': 'off',
				'@typescript-eslint/no-shadow': [ 'error' ],
				'@typescript-eslint/no-unused-vars': [
					'error',
					{ ignoreRestSiblings: true },
				],
				camelcase: 'off',
				'@typescript-eslint/naming-convention': [
					'error',
					{
						selector: [ 'method', 'variableLike' ],
						format: [ 'camelCase', 'PascalCase', 'UPPER_CASE' ],
						leadingUnderscore: 'allowSingleOrDouble',
						filter: {
							regex: 'webpack_public_path__',
							match: false,
						},
					},
					{
						selector: 'typeProperty',
						format: [ 'camelCase', 'snake_case' ],
						filter: {
							regex: 'API_FETCH_WITH_HEADERS|Block',
							match: false,
						},
					},
				],
				'react/react-in-jsx-scope': 'off',
				// Explicitly turning this on because we need to catch import errors that we don't catch with TS right now
				// due to it only being run in a checking capacity.
				'import/named': 'error',
				//  These should absolutely be linted, but due to there being a large number
				//  of changes needed to fix for example `export *` of packages with only default exports
				//  we will leave these as warnings for now until those can be fixed.
				'import/namespace': 'warn',
				'import/export': 'warn',
			},
			settings: {
				'import/parsers': {
					'@typescript-eslint/parser': [ '.ts', '.tsx' ],
				},
				'import/resolver': {
					typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
				},
				'import/core-modules': [
					...coreModules,
					// We should lint these modules imports, but the types are way out of date.
					// To support us not inadvertently introducing new import errors this lint exists, but to avoid
					// having to fix hundreds of import errors for @wordpress packages we ignore them.
					'@wordpress/components',
					'@wordpress/element',
					'@wordpress/blocks',
					'@wordpress/notices',
				],
			},
		},
		{
			files: [ '**/frontend.ts' ],
			rules: {
				'@typescript-eslint/no-use-before-define': 'off',
			},
		},
		{
			files: [ './assets/js/mapped-types.ts' ],
			rules: {
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-shadow': 'off',
				'no-shadow': 'off',
			},
		},
	],
};
