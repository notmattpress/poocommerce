/**
 * External dependencies
 */
import type { Page } from '@playwright/test';
import type { Editor } from '@poocommerce/e2e-utils';

export const getProductsNameFromClassicTemplate = async ( page: Page ) => {
	const products = page.locator( '.poocommerce-loop-product__title' );
	return products.allTextContents();
};

export const getProductsNameFromProductQuery = async ( page: Page ) => {
	const products = page.locator( '.wp-block-query .wp-block-post-title' );
	return products.allTextContents();
};

export const productQueryInnerBlocksTemplate = [
	{
		name: 'core/post-template',
		attributes: {
			__poocommerceNamespace:
				'poocommerce/product-query/product-template',
		},
		innerBlocks: [
			{ name: 'poocommerce/product-image' },
			{
				name: 'core/post-title',
				attributes: {
					__poocommerceNamespace:
						'poocommerce/product-query/product-title',
				},
			},
			{ name: 'poocommerce/product-price' },
			{ name: 'poocommerce/product-button' },
		],
	},
	{ name: 'core/query-pagination' },
	{ name: 'core/query-no-results' },
];

export const insertProductsQuery = async ( editor: Editor ) => {
	await editor.insertBlock( {
		name: 'core/query',
		attributes: {
			namespace: 'poocommerce/product-query',
			query: {
				inherit: true,
			},
		},
		innerBlocks: productQueryInnerBlocksTemplate,
	} );
};
