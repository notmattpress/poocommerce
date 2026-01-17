import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { filterSidebarItems } from './src/js/sidebar-filters';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'PooCommerce developer docs',
	favicon: 'img/favicon.ico',

	// Set the production url of your site here
	url: 'https://developer.poocommerce.com',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/docs/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'poocommerce', // Usually your GitHub org/user name.
	projectName: 'poocommerce', // Usually your repo name.

	onBrokenLinks: 'throw',
	markdown: {
		hooks: {
			onBrokenMarkdownLinks: 'warn',
		},
	},

	trailingSlash: true,

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: [ 'en' ],
	},

	plugins: [ './llms-txt/index.ts', './consent-plugin/index.ts' ],

	presets: [
		[
			'classic',
			{
				blog: false,
				pages: false,
				docs: {
					sidebarPath: './sidebars.ts',
					path: '../',
					exclude: [ '_docu-tools/**' ],
					showLastUpdateTime: true,
					editUrl:
						'https://github.com/poocommerce/poocommerce/tree/trunk/docs/docs/',
					routeBasePath: '/',

					// Custom sidebar filter to remove some items from the docs sidebar.
					async sidebarItemsGenerator( {
						defaultSidebarItemsGenerator,
						...args
					} ) {
						let sidebarItems = await defaultSidebarItemsGenerator(
							args
						);
						sidebarItems = filterSidebarItems( sidebarItems );
						return sidebarItems;
					},
				},
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		// Replace with your project's social card
		image: 'https://developer.poocommerce.com/docs/wp-content/uploads/sites/3/2025/03/woo-dev-docs-banner.png',
		navbar: {
			logo: {
				alt: 'PooCommerce developer docs',
				src: 'img/woo-dev-site-logo.svg',
				srcDark: 'img/woo-dev-site-logo-dark.svg',
				href: '/docs',
			},
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'docsSidebar',
					label: 'Docs',
				},
				{
					type: 'docSidebar',
					sidebarId: 'extensionsSidebar',
					label: 'Extensions',
				},
				{
					type: 'docSidebar',
					sidebarId: 'apiSidebar',
					label: 'API',
				},
				{
					type: 'docSidebar',
					sidebarId: 'cliSidebar',
					label: 'CLI',
				},
				{
					href: 'https://developer.poocommerce.com/',
					label: 'Blog',
					position: 'right',
				},
				{
					href: 'https://github.com/poocommerce/poocommerce/tree/trunk/docs',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			links: [
				{
					title: 'COMMUNITY',
					items: [
						{
							label: 'GitHub Discussions',
							href: 'https://github.com/poocommerce/poocommerce/discussions',
						},
						{
							label: 'Community Slack',
							href: 'https://poocommerce.com/community-slack/',
						},
						{
							label: 'Community Forum',
							href: 'https://wordpress.org/support/plugin/poocommerce/',
						},
						{
							label: 'Code of Conduct',
							href: 'https://developer.poocommerce.com/code-of-conduct/',
						},
						{
							label: 'Community Participation Guide',
							href: 'https://developer.poocommerce.com/community-participation-guide/',
						},
					],
				},
				{
					title: 'GROW WITH WOO',
					items: [
						{
							label: 'PooCommerce Marketplace',
							href: 'https://poocommerce.com/poocommerce-marketplace/',
						},
						{
							label: 'Become a Woo agency partner',
							href: 'https://poocommerce.com/for-agencies/',
						},
						{
							label: 'Become a Marketplace partner',
							href: 'https://poocommerce.com/partners/',
						},
						{
							label: 'Contribute to PooCommerce',
							href: '/docs/contribution/contributing',
						},
					],
				},
				{
					title: 'MORE',
					items: [
						{
							label: 'Woo Developer Blog',
							href: 'https://developer.poocommerce.com/',
						},
						{
							label: 'PooCommerce Monorepo',
							href: 'https://github.com/poocommerce/poocommerce/',
						},
						{
							label: 'PooCommerce Code Reference',
							href: 'https://poocommerce.github.io/code-reference/',
						},
						{
							label: 'Woo Storybook',
							href: 'https://poocommerce.github.io/poocommerce/',
						},
						{
							label: 'Merchant Documentation',
							href: 'https://poocommerce.com/docs',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/poocommerce/poocommerce/',
						},
					],
				},
			],
			copyright: `Copyright © ${ new Date().getFullYear() } Built with Docusaurus. Documentation is licensed under <a href="https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/license.txt/">GPLv3</a> and can be modified in the <a href="https://github.com/poocommerce/poocommerce/">PooCommerce Monorepo</a>.
				<div class="docusaurus-footer-for-automattic">
					<a href="https://automattic.com/">
						An
						<img src="img/automattic.svg" alt="Automattic" class="automattic-logo automattic-logo-light" />
						<img src="img/automattic_dark.svg" alt="Automattic" class="automattic-logo automattic-logo-dark" />
						Creation</a>
				</div>`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
			additionalLanguages: [ 'php' ],
		},
		// colorMode: {
		// 	defaultMode: 'light',
		// 	disableSwitch: true,
		// 	respectPrefersColorScheme: false,
		// },

		algolia: {
			// The application ID provided by Algolia
			appId: 'DGCTEY3UZR',
			// Public API key: it is safe to commit it
			apiKey: '8b541e433184605374ff8fb8985b3dc4',
			indexName: 'developer-poocommerce',
			contextualSearch: true,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
