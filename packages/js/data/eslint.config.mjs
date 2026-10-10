/**
 * Internal dependencies
 */
import poocommerce from '@poocommerce/eslint-config';
import { coreModules } from '@poocommerce/eslint-config/core-modules.js';

export default [
	...poocommerce,
	{
		settings: {
			'import/core-modules': [
				...coreModules,
				'@wordpress/api-fetch',
				'redux',
			],
			'import/resolver': {
				node: {},
				typescript: {},
			},
		},
	},
];
