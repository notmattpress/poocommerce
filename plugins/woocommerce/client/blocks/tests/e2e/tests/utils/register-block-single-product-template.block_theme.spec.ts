/**
 * External dependencies
 */
import { test, expect, BLOCK_THEME_SLUG } from '@poocommerce/e2e-utils';
import type { Editor, Admin } from '@poocommerce/e2e-utils';

const insertSingleProductBlock = async ( editor: Editor ) => {
	await editor.insertBlock( { name: 'poocommerce/single-product' } );
	await editor.canvas.getByText( 'Album' ).click();
	await editor.canvas.getByText( 'Done' ).click();
	const singleProductBlock = await editor.getBlockByName(
		'poocommerce/single-product'
	);
	const singleProductClientId =
		( await singleProductBlock.getAttribute( 'data-block' ) ) ?? '';
	return singleProductClientId;
};

const insertInSingleProductTemplate = async (
	blockName: string,
	editor: Editor,
	admin: Admin
) => {
	await admin.visitSiteEditor( {
		postId: `${ BLOCK_THEME_SLUG }//single-product`,
		postType: 'wp_template',
		canvas: 'edit',
	} );
	await editor.setContent( '' );
	await editor.insertBlock( { name: blockName } );
};

test.describe( 'registerProductBlockType registers', () => {
	test( 'block available on posts, e.g. Product Price', async ( {
		admin,
		editor,
	} ) => {
		const blockName = 'poocommerce/product-price';

		await test.step( 'Unavailable in post globally', async () => {
			await admin.createNewPost();
			await editor.insertBlock( { name: blockName } );
			await expect(
				await editor.getBlockByName( blockName )
			).toHaveCount( 0 );
		} );

		await test.step( 'Available in post within Single Product block', async () => {
			const singleProductClientId = await insertSingleProductBlock(
				editor
			);
			// One from the global inserter, one from the single product block
			await editor.insertBlock(
				{ name: blockName },
				{ clientId: singleProductClientId }
			);
			await expect(
				await editor.getBlockByName( blockName )
			).toHaveCount( 2 );
		} );

		await test.step( 'Available in Single Product template globally', async () => {
			await insertInSingleProductTemplate( blockName, editor, admin );
			await expect(
				await editor.getBlockByName( blockName )
			).toHaveCount( 1 );
		} );
	} );

	test( 'blocks are registered correctly when switching templates via command palette', async ( {
		admin,
		editor,
		page,
	} ) => {
		const blockName = 'poocommerce/product-price';
		const blockTitle = 'Product Price';
		await test.step( 'Blocks not available in non-product template', async () => {
			// Visit site editor with a non-product template
			await admin.visitSiteEditor( {
				postId: `${ BLOCK_THEME_SLUG }//coming-soon`,
				postType: 'wp_template',
				canvas: 'edit',
			} );

			// Try to insert the block
			await editor.insertBlock( { name: blockName } );
			await expect(
				await editor.getBlockByName( blockName )
			).toHaveCount( 0 );
		} );

		await test.step( 'Switch to Single Product template via command palette', async () => {
			// Open command palette
			if ( process.platform === 'darwin' ) {
				await page.keyboard.press( 'Meta+K' );
			} else {
				await page.keyboard.press( 'Control+K' );
			}

			const searchInput = page.getByRole( 'combobox', {
				name: 'Search',
			} );
			await expect( searchInput ).toBeVisible();

			await searchInput.fill( 'Single Product' );
			const templateOption = page.getByRole( 'option', {
				name: /Single Product/i,
			} );
			await expect( templateOption ).toBeVisible();
			await templateOption.click();

			await expect(
				await editor.getBlockByName( 'core/post-title' )
			).toBeVisible();
		} );

		await test.step( 'Blocks available after switching to Single Product template', async () => {
			await editor.setContent( '' );

			// Product Price is available in the global inserter. For some reason, using await editor.insertBlock( { name: blockName } ); does not work here.
			await editor.insertBlockUsingGlobalInserter( blockTitle );

			await expect(
				await editor.getBlockByName( blockName )
			).toHaveCount( 1 );
		} );
	} );

	test( 'blocks which are registered via the registerProductBlockType function are visible in the templates data views', async ( {
		admin,
		page,
		wpCoreVersion,
	} ) => {
		const productBlockTypes = [
			'poocommerce/product-price',
			'poocommerce/product-rating',
		];

		await admin.visitAdminPage(
			'site-editor.php?postType=wp_template&activeView=PooCommerce'
		);

		const singleProductTemplate =
			wpCoreVersion >= 6.8
				? page.getByLabel( 'Single Product' )
				: page.getByRole( 'button', { name: 'Single Product' } );

		await expect( singleProductTemplate ).toBeVisible();

		const previewCanvas = singleProductTemplate.frameLocator(
			'iframe[title="Editor canvas"]'
		);

		// Wait for the iframe to be fully loaded.
		await previewCanvas.locator( 'body' ).evaluate( () => {
			return document?.readyState === 'complete';
		} );

		for ( const blockType of productBlockTypes ) {
			const block = previewCanvas.locator(
				`[data-type="${ blockType }"]`
			);
			await expect( block.first() ).toBeAttached();
		}
	} );

	test( 'block unavailable on posts, e.g. Product Image Gallery', async ( {
		admin,
		editor,
	} ) => {
		const blockName = 'poocommerce/product-image-gallery';

		await test.step( 'Unavailable in post, also within Single Product block', async () => {
			await admin.createNewPost();
			await insertSingleProductBlock( editor );

			await editor.canvas
				.getByRole( 'button', { name: 'Add block' } )
				.click();

			await editor.page
				.getByRole( 'searchbox', { name: 'Search' } )
				.fill( blockName );

			await expect(
				editor.page.getByText( 'Product Image Gallery' )
			).toBeHidden();
		} );

		await test.step( 'Available in Single Product template globally', async () => {
			await insertInSingleProductTemplate( blockName, editor, admin );
			await expect(
				await editor.getBlockByName( blockName )
			).toHaveCount( 1 );
		} );
	} );
} );
