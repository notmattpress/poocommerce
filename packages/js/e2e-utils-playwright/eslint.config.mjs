/**
 * Internal dependencies
 */
import poocommerce from '@poocommerce/eslint-config';

/*
 * The eslintrc this replaces set no `extends` and no `root`, so it inherited the
 * repo root config by cascade. Flat config does not cascade, so spread the
 * shared config explicitly.
 */
export default [
	...poocommerce,
	{
		rules: {
			'no-console': 'off',
		},
	},
];
