/**
 * Internal dependencies
 */
import poocommerce from '@poocommerce/eslint-config';

export default [
	...poocommerce,
	{
		files: [ 'bin/**/*.js', 'src/**/*.js', 'test/**/*.js' ],
		// Extension webpack configs, CLI and Node tests use CommonJS.
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
];
