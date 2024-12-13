/**
 * Internal dependencies
 */
import { isWooExpress } from '~/utils/is-woo-express';
import { THEME_SLUG } from './constants';

const introPatternWooExpress = 'poocommerce-blocks/hero-product-split';
export const headerTemplateId = `${ THEME_SLUG }//header`;
export const footerTemplateId = `${ THEME_SLUG }//footer`;

export const HEADER_TEMPLATES = {
	template1: {
		blocks: [ 'poocommerce-blocks/header-centered-menu' ],
	},
	template2: {
		blocks: [ 'poocommerce-blocks/header-essential' ],
	},
	template3: {
		blocks: [ 'poocommerce-blocks/header-centered-menu' ],
	},
};

export const FOOTER_TEMPLATES = {
	template1: {
		blocks: [ 'poocommerce-blocks/footer-with-3-menus' ],
	},
	template2: {
		blocks: [ 'poocommerce-blocks/footer-large' ],
	},
	template3: {
		blocks: [ 'poocommerce-blocks/footer-with-3-menus' ],
	},
};

export const HOMEPAGE_TEMPLATES = {
	template1: {
		blocks: [
			// Body
			isWooExpress()
				? introPatternWooExpress
				: 'poocommerce-blocks/just-arrived-full-hero',
			'poocommerce-blocks/product-collection-5-columns',
			'poocommerce-blocks/hero-product-3-split',
			'poocommerce-blocks/product-collection-3-columns',
			'poocommerce-blocks/testimonials-3-columns',
			'poocommerce-blocks/featured-category-triple',
			'poocommerce-blocks/social-follow-us-in-social-media',
		],
		metadata: {
			businessType: [ 'e-commerce', 'large-business' ],
			contentFocus: [ 'featured products' ],
			audience: [ 'general' ],
			design: [ 'contemporary' ],
			features: [
				'fullwidth-image-banner',
				'testimonials',
				'social-media',
				'search',
			],
			complexity: 'high',
		},
	},
	template2: {
		blocks: [
			// Body
			isWooExpress()
				? introPatternWooExpress
				: 'poocommerce-blocks/featured-category-cover-image',
			'poocommerce-blocks/product-collection-4-columns',
			'poocommerce-blocks/hero-product-chessboard',
			'poocommerce-blocks/product-collection-5-columns',
			'poocommerce-blocks/testimonials-3-columns',
		],
		metadata: {
			businessType: [ 'e-commerce', 'subscription', 'large-business' ],
			contentFocus: [ 'catalog' ],
			audience: [ 'general' ],
			design: [ 'contemporary' ],
			features: [ 'small-banner', 'testimonials', 'newsletter' ],
			complexity: 'high',
		},
	},
	template3: {
		blocks: [
			// Body
			'poocommerce-blocks/hero-product-split',
			'poocommerce-blocks/product-collection-featured-products-5-columns',
			'poocommerce-blocks/featured-category-triple',
			'poocommerce-blocks/product-query-product-gallery',
		],
		metadata: {
			businessType: [ 'subscription', 'large-business' ],
			contentFocus: [ 'catalog', 'call-to-action' ],
			audience: [ 'general' ],
			design: [ 'contemporary' ],
			features: [ 'small-banner', 'social-media' ],
			complexity: 'high',
		},
	},
};
