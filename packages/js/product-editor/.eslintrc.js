module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	overrides: [
		{
			files: [ '**/*.js', '**/*.jsx', '**/*.tsx' ],
			rules: {
				'react/react-in-jsx-scope': 'off',
			},
		},
	],
	settings: {
		'import/core-modules': [
			'@poocommerce/admin-layout',
			'@poocommerce/block-templates',
			'@poocommerce/components',
			'@poocommerce/customer-effort-score',
			'@poocommerce/currency',
			'@poocommerce/data',
			'@poocommerce/experimental',
			'@poocommerce/expression-evaluation',
			'@poocommerce/navigation',
			'@poocommerce/number',
			'@poocommerce/settings',
			'@poocommerce/tracks',
			'@wordpress/blocks',
			'@wordpress/block-editor',
			'@wordpress/components',
			'@wordpress/core-data',
			'@wordpress/date',
			'@wordpress/element',
			'@wordpress/keycodes',
			'@wordpress/media-utils',
			'@testing-library/react',
			'dompurify',
			'react-router-dom',
		],
		'import/resolver': {
			node: {},
			webpack: {},
			typescript: {},
		},
	},
};
