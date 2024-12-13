module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	settings: {
		'import/core-modules': [ '@poocommerce/components' ],
		'import/resolver': {
			node: {},
			webpack: {},
			typescript: {},
		},
	},
};
