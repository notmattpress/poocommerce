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
				'@storybook/react-webpack5',
				'react-transition-group/CSSTransition',
				'dompurify',
			],
			'import/resolver': {
				node: {},
				webpack: {},
				typescript: {},
			},
		},
	},
];
