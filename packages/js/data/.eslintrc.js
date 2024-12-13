module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	settings: {
		'import/core-modules': [
			'@poocommerce/date',
			'@poocommerce/navigation',
			'@poocommerce/tracks',
			'@wordpress/api-fetch',
			'@wordpress/core-data',
			'@wordpress/data',
			'@automattic/data-stores',
			'redux',
		],
		'import/resolver': {
			node: {},
			typescript: {},
		},
	},
};
