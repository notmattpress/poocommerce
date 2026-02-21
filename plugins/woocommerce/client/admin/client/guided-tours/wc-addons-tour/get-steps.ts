/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { TourKitTypes } from '@poocommerce/components';

export const getSteps = (): TourKitTypes.WooStep[] => {
	const lineBreak = createElement( 'br' );
	return [
		{
			referenceElements: {
				desktop:
					'#adminmenu a[href="admin.php?page=wc-admin&path=%2Fextensions"]',
			},
			focusElement: {
				desktop:
					'#adminmenu a[href="admin.php?page=wc-admin&path=%2Fextensions"]',
			},
			meta: {
				name: 'wc-extensions-menu-item',
				heading: __(
					'Welcome to the PooCommerce Marketplace',
					'poocommerce'
				),
				descriptions: {
					desktop: createInterpolateElement(
						__(
							"Power up your store by adding extra functionality with extensions or integrate your store with other software and services.<br/><br/>Here you'll find hundreds of trusted solutions for your store — all reviewed and approved by the Woo team.<br/><br/>You can also browse the Woo Marketplace at PooCommerce.com.",
							'poocommerce'
						),
						{
							br: lineBreak,
						}
					),
				},
			},
		},
		{
			referenceElements: {
				desktop: '.poocommerce-marketplace__search',
			},
			focusElement: {
				desktop: '.poocommerce-marketplace__search',
			},
			meta: {
				name: 'wc-extensions-search',
				heading: __( 'Find exactly what you need', 'poocommerce' ),
				descriptions: {
					desktop: __(
						'Use the search box to find specific extensions or solutions.',
						'poocommerce'
					),
				},
			},
		},
		{
			referenceElements: {
				desktop: '.poocommerce-marketplace__tab-browse',
			},
			focusElement: {
				desktop: '.poocommerce-marketplace__tab-browse',
			},
			meta: {
				name: 'wc-addons-categories',
				heading: __( 'Browse for new ideas', 'poocommerce' ),
				descriptions: {
					desktop: createInterpolateElement(
						__(
							"Or if you're not sure exactly what you need, you can browse all available extensions by category.",
							'poocommerce'
						),
						{
							br: lineBreak,
						}
					),
				},
			},
		},
		{
			referenceElements: {
				desktop: '.poocommerce-marketplace__discover:first-child',
			},
			focusElement: {
				desktop: '.poocommerce-marketplace__discover:first-child',
			},
			meta: {
				name: 'wc-addons-featured',
				heading: __( 'Learn more about each product', 'poocommerce' ),
				descriptions: {
					desktop: createInterpolateElement(
						__(
							'Scroll down to see all of the relevant extensions and solutions.<br/><br/>Click on any solution to learn more about its features, any installation requirements, and available documentation.',
							'poocommerce'
						),
						{
							br: lineBreak,
						}
					),
				},
			},
		},
		{
			referenceElements: {
				desktop: '.poocommerce-marketplace__header-meta',
			},
			focusElement: {
				desktop: '.poocommerce-marketplace__header-meta',
			},
			meta: {
				name: 'wc-addons-my-subscriptions',
				heading: __( 'Manage your purchases', 'poocommerce' ),
				descriptions: {
					desktop: createInterpolateElement(
						__(
							"All of your Woo Marketplace purchases can be found here, or on PooCommerce.com.<br/><br/>Every purchase is backed by our <a1>30-day money-back guarantee</a1>, and includes <a2>email and live chat support</a2>.<br/><br/>That's it! You're now ready to power up your store.",
							'poocommerce'
						),
						{
							a1: createElement(
								'a',
								{
									href: 'https://poocommerce.com/refund-policy/',
									'aria-label': __(
										'Refund policy',
										'poocommerce'
									),
								},
								__(
									'30-day money-back guarantee',
									'poocommerce'
								)
							),
							a2: createElement(
								'a',
								{
									href: 'https://poocommerce.com/my-account/create-a-ticket/',
									'aria-label': __(
										'Contact support',
										'poocommerce'
									),
								},
								__(
									'email and live chat support',
									'poocommerce'
								)
							),
							br: lineBreak,
						}
					),
				},
			},
		},
	];
};
