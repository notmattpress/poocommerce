module.exports = {
	extends: [ 'plugin:@poocommerce/eslint-plugin/recommended' ],
	plugins: [ 'jest' ],
	root: true,
	rules: {
		// These warning rules are stop gaps for eslint issues that need to be fixed later.
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
	},
};
