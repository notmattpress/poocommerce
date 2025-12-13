module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	settings: {
		'import/core-modules': [
			'@poocommerce/data',
			'@poocommerce/experimental',
			'@poocommerce/navigation',
			'@poocommerce/tracks',
			'@testing-library/react',
		],
		'import/resolver': {
			node: {},
			webpack: {},
			typescript: {},
		},
	},
};
