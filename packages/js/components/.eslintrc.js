module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	ignorePatterns: [ '**/test/*.ts', '**/test/*.tsx' ],
	overrides: [
		{
			files: [
				'**/stories/*.js',
				'**/stories/*.jsx',
				'**/docs/example.js',
			],
			rules: {
				'import/no-unresolved': [
					'warn',
					{ ignore: [ '@poocommerce/components' ] },
				],
			},
		},
	],
	settings: {
		'import/core-modules': [
			'@poocommerce/components',
			'@poocommerce/currency',
			'@poocommerce/data',
			'@poocommerce/date',
			'@poocommerce/navigation',
			'@storybook/react',
			'@automattic/tour-kit',
			'@wordpress/blocks',
			'@wordpress/components',
			'@wordpress/element',
			'@wordpress/media-utils',
			'dompurify',
			'downshift',
			'moment',
		],
		'import/resolver': {
			node: {},
			webpack: {},
			typescript: {},
		},
	},
};
