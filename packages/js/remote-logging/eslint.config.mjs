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
			'import/core-modules': [ ...coreModules ],
			'import/resolver': {
				node: {},
				typescript: {},
			},
		},
	},
];
