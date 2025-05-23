/**
 * External dependencies
 */
import { test, expect, wpCLI, BlockData, Editor } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */

const blockData: Partial< BlockData > = {
	name: 'poocommerce/legacy-template',
};

const classicTemplateBlockNames = [
	'PooCommerce Classic Template',
	'Product (Classic)',
	'Product Attribute (Classic)',
	'Product Category (Classic)',
	'Product Tag (Classic)',
	"Product's Custom Taxonomy (Classic)",
	'Product Search Results (Classic)',
	'Product Grid (Classic)',
];

const templates = [
	{
		title: 'Single Product',
		slug: 'single-product',
		path: '/product/hoodie',
	},
	{
		title: 'Product Attribute',
		slug: 'taxonomy-product_attribute',
		path: '/color/blue',
	},
	{
		title: 'Product Category',
		slug: 'taxonomy-product_cat',
		path: '/product-category/clothing',
	},
	{
		title: 'Product Tag',
		slug: 'taxonomy-product_tag',
		path: '/product-tag/recommended/',
	},
	{
		title: 'Product Catalog',
		slug: 'archive-product',
		path: '/shop/',
	},
	{
		title: 'Product Search Results',
		slug: 'product-search-results',
		path: '/?s=shirt&post_type=product',
	},
];

const getClassicTemplateBlocksInInserter = async ( {
	editor,
}: {
	editor: Editor;
} ) => {
	await editor.openGlobalBlockInserter();

	await editor.page
		.getByRole( 'searchbox', { name: 'Search' } )
		.fill( 'classic' );

	// Wait for blocks search to have finished.
	await expect(
		editor.page.getByRole( 'heading', {
			name: 'Available to install',
			exact: true,
		} )
	).toBeVisible();

	const inserterBlocks = editor.page.getByRole( 'listbox', {
		name: 'Blocks',
		exact: true,
	} );
	const options = inserterBlocks.locator( 'role=option' );

	// Filter out blocks that don't match one of the possible Classic Template block names (case-insensitive).
	const classicTemplateBlocks = await options.evaluateAll(
		( elements, blockNames ) => {
			const blockOptions = elements.filter( ( element ) => {
				return blockNames.some(
					( name ) => element.textContent === name
				);
			} );
			return blockOptions.map( ( element ) => element.textContent );
		},
		classicTemplateBlockNames
	);

	return classicTemplateBlocks;
};

test.describe( `${ blockData.name } Block `, () => {
	test.beforeEach( async () => {
		await wpCLI(
			'option update wc_blocks_use_blockified_product_grid_block_as_template false'
		);
	} );

	test( `is registered/unregistered when navigating from a non-WC template to a WC template and back`, async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `twentytwentyfour//home`,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		let classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks ).toHaveLength( 0 );

		await editor.page.getByLabel( 'Open Navigation' ).click();
		await editor.page
			.getByLabel( 'Product Catalog', { exact: true } )
			.click();

		classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks ).toHaveLength( 1 );

		await editor.page.getByLabel( 'Open Navigation' ).click();
		await editor.page.getByLabel( 'Blog Home', { exact: true } ).click();

		classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks ).toHaveLength( 0 );
	} );

	test( `is registered/unregistered when navigating from a WC template to a non-WC template and back`, async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `poocommerce/poocommerce//archive-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		let classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks ).toHaveLength( 1 );

		await editor.page.getByLabel( 'Open Navigation' ).click();
		await editor.page.getByLabel( 'Blog Home', { exact: true } ).click();

		classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks ).toHaveLength( 0 );

		await editor.page.getByLabel( 'Open Navigation' ).click();
		await editor.page
			.getByLabel( 'Product Catalog', { exact: true } )
			.click();

		classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks ).toHaveLength( 1 );
	} );

	test( `updates block title when navigating between WC templates`, async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `poocommerce/poocommerce//archive-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		let classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks[ 0 ] ).toBe( 'Product Grid (Classic)' );

		await editor.page.getByLabel( 'Open Navigation' ).click();
		await editor.page
			.getByLabel( 'Product Search Results', { exact: true } )
			.click();

		classicTemplateBlocks = await getClassicTemplateBlocksInInserter( {
			editor,
		} );

		expect( classicTemplateBlocks[ 0 ] ).toBe(
			'Product Search Results (Classic)'
		);
	} );

	test( `is not available when editing template parts`, async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `twentytwentyfour//header`,
			postType: 'wp_template_part',
			canvas: 'edit',
		} );

		const classicTemplateBlocks = await getClassicTemplateBlocksInInserter(
			{
				editor,
			}
		);

		expect( classicTemplateBlocks ).toHaveLength( 0 );
	} );

	// @see https://github.com/poocommerce/poocommerce-blocks/issues/9637
	test( `is still available after resetting a modified WC template`, async ( {
		admin,
		editor,
		wpCoreVersion,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `poocommerce/poocommerce//single-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await editor.insertBlock( {
			name: 'core/paragraph',
			attributes: { content: 'Hello World' },
		} );

		await editor.saveSiteEditorEntities( {
			isOnlyCurrentEntityDirty: true,
		} );

		await editor.page.getByLabel( 'Open Navigation' ).click();

		// Reset the template.
		await editor.page.getByPlaceholder( 'Search' ).fill( 'Single Product' );
		const resetNotice = editor.page
			.getByLabel( 'Dismiss this notice' )
			.getByText( `"Single Product" reset.` );
		const searchResults = editor.page.getByLabel( 'Actions', {
			exact: true,
		} );
		// Wait until there's only one search result.
		await expect.poll( async () => await searchResults.count() ).toBe( 1 );

		const actionsButton = editor.page.getByRole( 'button', {
			name: 'Actions',
		} );
		await actionsButton.click();

		await editor.page.getByRole( 'menuitem', { name: 'Reset' } ).click();
		await editor.page.getByRole( 'button', { name: 'Reset' } ).click();
		await expect( resetNotice ).toBeVisible();

		const editButton = editor.page.getByRole( 'menuitem', {
			name: 'Edit',
		} );
		if ( wpCoreVersion >= 6.8 ) {
			await actionsButton.click();
		}

		// Edit the template again.
		await editButton.click();

		// Verify the Classic Template block is still registered.
		const classicTemplateBlocks = await getClassicTemplateBlocksInInserter(
			{
				editor,
			}
		);

		expect( classicTemplateBlocks ).toHaveLength( 1 );
	} );

	for ( const template of templates ) {
		test( `is rendered on ${ template.title } template`, async ( {
			admin,
			editor,
			page,
		} ) => {
			await admin.visitSiteEditor( {
				postId: `poocommerce/poocommerce//${ template.slug }`,
				postType: 'wp_template',
				canvas: 'edit',
			} );

			const block = editor.canvas.locator(
				`[data-type="${ blockData.name }"]`
			);

			await expect( block ).toBeVisible();

			await page.goto( template.path );

			await expect( page.locator( 'div[data-template]' ) ).toBeVisible();
		} );
	}
} );
