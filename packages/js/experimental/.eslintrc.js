module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	root: true,
	settings: {
		'import/core-modules': [
			'@poocommerce/components',
			'@wordpress/components',
			'@storybook/react',
			'react-transition-group/CSSTransition',
			'dompurify',
		],
		'import/resolver': {
			node: {},
			webpack: {},
			typescript: {},
		},
	},
};
