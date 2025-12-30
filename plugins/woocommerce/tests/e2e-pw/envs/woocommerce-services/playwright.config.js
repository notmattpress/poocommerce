let config = require( '../../playwright.config.js' );
const { tags } = require( '../../fixtures/fixtures' );

process.env.USE_WP_ENV = 'true';

config = {
	...config.default,
	projects: [
		...config.setupProjects,
		{
			name: 'PooCommerce Shipping & Tax',
			grep: new RegExp( tags.SERVICES ),
			dependencies: [ 'site setup' ],
		},
	],
};

module.exports = config;
