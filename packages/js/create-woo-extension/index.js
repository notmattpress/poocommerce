module.exports = {
	templatesPath: __dirname,
	defaultValues: {
		npmDependencies: [
			'@wordpress/hooks',
			'@wordpress/i18n',
			'@poocommerce/components',
		],
		npmDevDependencies: [
			'@poocommerce/dependency-extraction-webpack-plugin',
			'@poocommerce/eslint-plugin',
			'@wordpress/prettier-config',
			'@wordpress/scripts@24.6.0',
		],
		namespace: 'extension',
		license: 'GPL-3.0+',
		customScripts: {
			postinstall: 'composer install',
		},
	},
};
