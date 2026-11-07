/**
 * Internal dependencies
 */
import poocommerce from '@poocommerce/eslint-config';

export default [
	...poocommerce,
	// A command-line tool reports progress on the terminal.
	{ rules: { 'no-console': 'off' } },
];
