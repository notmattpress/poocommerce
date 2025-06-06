/**
 * External dependencies
 */
import { test as base, expect } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import { ProductFiltersPage } from './product-filters.page';

const blockData = {
	name: 'poocommerce/product-filter-attribute',
	selectors: {
		frontend: {},
		editor: {
			settings: {},
		},
	},
	slug: 'archive-product',
};

const test = base.extend< { pageObject: ProductFiltersPage } >( {
	pageObject: async ( { page, editor, frontendUtils }, use ) => {
		const pageObject = new ProductFiltersPage( {
			page,
			editor,
			frontendUtils,
		} );
		await use( pageObject );
	},
} );

test.describe( `${ blockData.name }`, () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.visitSiteEditor( {
			postId: `poocommerce/poocommerce//${ blockData.slug }`,
			postType: 'wp_template',
			canvas: 'edit',
		} );
	} );

	test( 'should display the correct inspector style controls', async ( {
		editor,
		pageObject,
	} ) => {
		await pageObject.addProductFiltersBlock( { cleanContent: true } );

		const block = editor.canvas.getByLabel( 'Block: Color' );

		await expect( block ).toBeVisible();

		await editor.selectBlocks( block );
		await editor.openDocumentSettingsSidebar();
		await editor.page.getByRole( 'tab', { name: 'Styles' } ).click();

		await expect(
			editor.page.getByText( 'ColorAll options are currently hidden' )
		).toBeVisible();
		await expect(
			editor.page.getByText(
				'TypographyAll options are currently hidden'
			)
		).toBeVisible();
		await expect(
			editor.page.getByText(
				'DimensionsAll options are currently hidden'
			)
		).toBeVisible();
	} );

	test( 'should display the correct inspector setting controls', async ( {
		editor,
		pageObject,
	} ) => {
		await pageObject.addProductFiltersBlock( { cleanContent: true } );

		const block = editor.canvas.getByLabel( 'Block: Color' );

		await expect( block ).toBeVisible();

		await editor.selectBlocks( block );

		await editor.openDocumentSettingsSidebar();
		await editor.page.getByRole( 'tab', { name: 'Settings' } ).click();

		await expect(
			editor.page.getByLabel( 'Editor settings' ).getByRole( 'button', {
				name: 'Attribute',
				exact: true,
			} )
		).toBeVisible();

		await expect( editor.page.getByText( 'Sort order' ) ).toBeVisible();
		await expect( editor.page.getByText( 'LogicAnyAll' ) ).toBeVisible();
		await expect( editor.page.getByText( 'ListChips' ) ).toBeVisible();
	} );

	test( 'should dynamically set block title and heading based on the selected attribute', async ( {
		editor,
		pageObject,
	} ) => {
		await pageObject.addProductFiltersBlock( { cleanContent: true } );

		const block = editor.canvas.getByLabel( 'Block: Color' );

		await editor.openDocumentSettingsSidebar();
		await editor.selectBlocks( block );

		await editor.page
			.getByRole( 'tabpanel' )
			.getByRole( 'combobox' )
			.first()
			.click();
		await editor.page
			.getByRole( 'option', { name: 'Size', exact: true } )
			.click();

		await pageObject.page.getByLabel( 'Document Overview' ).click();
		const listView = pageObject.page.getByLabel( 'List View' );

		await expect( listView ).toBeVisible();

		const productFilterAttributeSizeBlockListItem = listView.getByText(
			'Size' // it must select the attribute with the highest product count
		);
		await expect( productFilterAttributeSizeBlockListItem ).toBeVisible();

		const productFilterAttributeWrapperBlock =
			editor.canvas.getByLabel( 'Block: Size' );
		await editor.selectBlocks( productFilterAttributeWrapperBlock );
		await expect( productFilterAttributeWrapperBlock ).toBeVisible();

		const productFilterAttributeBlockHeading =
			productFilterAttributeWrapperBlock.getByText( 'Size', {
				exact: true,
			} );

		await expect( productFilterAttributeBlockHeading ).toBeVisible();
	} );
} );
