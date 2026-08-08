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
				'@wordpress/compose',
				'@wordpress/dataviews',
				'@wordpress/html-entities',
				'@wordpress/i18n',
				'@wordpress/icons',
				'@wordpress/private-apis',
				'@wordpress/router',
				'@wordpress/url',
				'@testing-library/react',
				'clsx',
				'react',
			],
			'import/resolver': {
				node: {},
				webpack: {},
				typescript: {},
			},
		},
	},
	{
		files: [ '**/*.js', '**/*.jsx', '**/*.tsx' ],
		rules: {
			'react/react-in-jsx-scope': 'off',
		},
	},
];
