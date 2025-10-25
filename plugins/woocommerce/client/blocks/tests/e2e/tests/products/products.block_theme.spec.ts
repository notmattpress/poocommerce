/**
 * External dependencies
 */
import {
	test,
	expect,
	BlockData,
	BLOCK_THEME_SLUG,
} from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import {
	getProductsNameFromClassicTemplate,
	getProductsNameFromProductQuery,
	insertProductsQuery,
} from './utils';

const blockData: BlockData = {
	name: 'core/query',
	slug: '',
	mainClass: '.wc-block-price-filter',
	selectors: {
		frontend: {},
		editor: {},
	},
};

const templates = {
	// This test is disabled because archives are disabled for attributes by default. This can be uncommented when this is toggled on.
	//'taxonomy-product_attribute': {
	//	templateTitle: 'Product Attribute',
	//	slug: 'taxonomy-product_attribute',
	//	frontendPage: '/product-attribute/color/',
	//	legacyBlockName: 'poocommerce/legacy-template',
	//	needsCreation: false,
	//},
	'taxonomy-product_cat': {
		templateTitle: 'Product Category',
		slug: 'taxonomy-product_cat',
		frontendPage: '/product-category/music/',
		legacyBlockName: 'poocommerce/legacy-template',
		needsCreation: true,
	},
	'taxonomy-product_tag': {
		templateTitle: 'Product Tag',
		slug: 'taxonomy-product_tag',
		frontendPage: '/product-tag/recommended/',
		legacyBlockName: 'poocommerce/legacy-template',
		needsCreation: true,
	},
	'archive-product': {
		templateTitle: 'Product Catalog',
		slug: 'archive-product',
		frontendPage: '/shop/',
		legacyBlockName: 'poocommerce/legacy-template',
		needsCreation: false,
	},
	'product-search-results': {
		templateTitle: 'Product Search Results',
		slug: 'product-search-results',
		frontendPage: '/?s=shirt&post_type=product',
		legacyBlockName: 'poocommerce/legacy-template',
		needsCreation: false,
	},
};

test.describe( `${ blockData.name } Block `, () => {
	test( 'when Inherits Query From Template other options are hidden, show up otherwise', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `${ BLOCK_THEME_SLUG }//archive-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );
		await editor.setContent( '' );
		await insertProductsQuery( editor );
		const block = await editor.getBlockByName( blockData.name );
		await editor.selectBlocks( block );
		await editor.openDocumentSettingsSidebar();
		const advancedFilterOption = page.getByLabel(
			'Advanced Filters options'
		);
		const inheritQueryFromTemplateOption = page.getByLabel(
			'Inherit query from template'
		);

		await expect( advancedFilterOption ).toBeHidden();
		await expect( inheritQueryFromTemplateOption ).toBeVisible();

		await inheritQueryFromTemplateOption.click();

		await expect( advancedFilterOption ).toBeVisible();
		await expect( inheritQueryFromTemplateOption ).toBeVisible();
	} );
} );

for ( const {
	templateTitle,
	slug,
	frontendPage,
	legacyBlockName,
	needsCreation,
} of Object.values( templates ) ) {
	test.describe( `${ templateTitle } template`, () => {
		test( 'Products block matches with classic template block', async ( {
			admin,
			editor,
			page,
		} ) => {
			if ( needsCreation ) {
				await admin.visitSiteEditor( {
					postType: 'wp_template',
				} );
				await editor.createTemplate( {
					templateName: 'Products by Category',
				} );
			} else {
				await admin.visitSiteEditor( {
					postId: `${ BLOCK_THEME_SLUG }//${ slug }`,
					postType: 'wp_template',
					canvas: 'edit',
				} );
			}
			await editor.setContent( '' );
			await insertProductsQuery( editor );
			await editor.insertBlock( { name: legacyBlockName } );
			await editor.canvas.locator( 'body' ).click();

			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );

			await page.goto( frontendPage );

			const classicProducts = await getProductsNameFromClassicTemplate(
				page
			);
			const productQueryProducts = await getProductsNameFromProductQuery(
				page
			);

			expect( classicProducts ).toEqual( productQueryProducts );
		} );
	} );
}
