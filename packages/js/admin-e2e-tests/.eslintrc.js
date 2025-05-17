module.exports = {
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:@poocommerce/eslint-plugin/recommended',
	],
	root: true,
	settings: {
		'import/core-modules': [ '@poocommerce/e2e-utils' ],
		'import/resolver': {
			node: {},
			typescript: {},
		},
	},
};
