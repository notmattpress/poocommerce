module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	ignorePatterns: [ '**/test/*.ts', '**/test/*.tsx' ],
	settings: {
		'import/core-modules': [ '@poocommerce/settings' ],
		'import/resolver': {
			node: {},
			typescript: {},
		},
	},
};
