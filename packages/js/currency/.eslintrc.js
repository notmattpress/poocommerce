module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	settings: {
		'import/core-modules': [
			'@poocommerce/number',
			'@poocommerce/settings',
		],
		'import/resolver': {
			node: {},
			typescript: {},
		},
	},
};
