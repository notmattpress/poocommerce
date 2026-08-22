/**
 * External dependencies
 */
import { globalIgnores } from 'eslint/config';

/**
 * Internal dependencies
 */
import poocommerce from '@poocommerce/eslint-config';
import { coreModules } from '@poocommerce/eslint-config/core-modules.js';

export default [
	...poocommerce,
	globalIgnores( [ '**/test/*.ts', '**/test/*.tsx' ] ),
	{
		settings: {
			'import/core-modules': [
				...coreModules,
				'@storybook/react',
				'@automattic/tour-kit',
				'dompurify',
				'downshift',
				'moment',
			],
			'import/resolver': {
				node: {},
				webpack: {},
				typescript: {},
			},
		},
	},
	{
		files: [ '**/stories/*.js', '**/stories/*.jsx', '**/docs/example.js' ],
		rules: {
			'import/no-unresolved': [
				'warn',
				{ ignore: [ '@poocommerce/components' ] },
			],
		},
	},
];
