/**
 * External dependencies
 */
import { test, expect } from '@poocommerce/e2e-utils';

test.describe( 'Product Gallery Thumbnails block', () => {
	test.beforeEach( async ( { admin, editor, requestUtils } ) => {
		const template = await requestUtils.createTemplate( 'wp_template', {
			slug: 'single-product',
			title: 'Custom Single Product',
			content: 'placeholder',
		} );

		await admin.visitSiteEditor( {
			postId: template.id,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await expect( editor.canvas.getByText( 'placeholder' ) ).toBeVisible();

		await editor.insertBlock( {
			name: 'poocommerce/product-gallery',
		} );

		await editor.saveSiteEditorEntities( {
			isOnlyCurrentEntityDirty: true,
		} );
	} );

	test( 'renders as expected', async ( { page, editor } ) => {
		await test.step( 'in editor', async () => {
			const productGalleryBlock = editor.canvas.locator(
				'[data-type="poocommerce/product-gallery"]'
			);

			await expect(
				productGalleryBlock.locator(
					'[data-type="poocommerce/product-gallery-thumbnails"]'
				)
			).toBeVisible();

			await expect(
				productGalleryBlock.locator(
					`[data-type="poocommerce/product-gallery-thumbnails"]:left-of(
						[data-type="poocommerce/product-gallery-large-image"]
					)`
				)
			).toBeVisible();
		} );

		await test.step( 'in frontend', async () => {
			await page.goto( '/product/hoodie/' );

			const productGalleryBlock = page.locator(
				'[data-block-name="poocommerce/product-gallery"]'
			);

			const thumbnailsContainer = productGalleryBlock.locator(
				'[data-block-name="poocommerce/product-gallery-thumbnails"]'
			);

			await expect( thumbnailsContainer ).toBeVisible();

			await expect(
				productGalleryBlock.locator(
					`[data-block-name="poocommerce/product-gallery-thumbnails"]:left-of(
						[data-block-name="poocommerce/product-gallery-large-image"]
					)`
				)
			).toBeVisible();

			const thumbnailsCount = thumbnailsContainer.locator(
				'.wc-block-product-gallery-thumbnails__thumbnail'
			);

			await expect( thumbnailsCount ).toHaveCount( 4 );
		} );
	} );

	test( 'thumbnail size settings work correctly', async ( {
		page,
		editor,
	} ) => {
		await test.step( 'in editor', async () => {
			const largeImageBlock = editor.canvas.locator(
				'[data-type="poocommerce/product-gallery-large-image"]'
			);
			const thumbnailsBlock = editor.canvas.locator(
				'[data-type="poocommerce/product-gallery-thumbnails"]'
			);
			const thumbnailsSizeInput = page.getByLabel( 'Thumbnail Size' );

			// Open block settings
			await thumbnailsBlock.click();
			await editor.openDocumentSettingsSidebar();

			await expect( thumbnailsSizeInput ).toHaveValue( '25' );
			await expect( async () => {
				const largeImageBox = await largeImageBlock.boundingBox();
				const thumbnailsBox = await thumbnailsBlock.boundingBox();
				const largeImageWidth = largeImageBox?.width ?? 0;
				const thumbnailsWidth = thumbnailsBox?.width ?? 0;

				expect( thumbnailsWidth ).toBeCloseTo(
					largeImageWidth * 0.25,
					0
				);
			} ).toPass( { timeout: 3_000 } );

			await expect( async () => {
				// Set size to 10%
				await thumbnailsSizeInput.fill( '10' );

				const largeImageBox = await largeImageBlock.boundingBox();
				const thumbnailsBox = await thumbnailsBlock.boundingBox();
				const largeImageWidth = largeImageBox?.width ?? 0;
				const thumbnailsWidth = thumbnailsBox?.width ?? 0;

				expect( thumbnailsWidth ).toBeCloseTo(
					largeImageWidth * 0.1,
					0
				);
			} ).toPass( { timeout: 3_000 } );

			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );
		} );

		await test.step( 'in frontend', async () => {
			await page.goto( '/product/hoodie/' );

			const thumbnailsBlock = page.locator(
				'[data-block-name="poocommerce/product-gallery-thumbnails"]'
			);
			const largeImageBlock = page.locator(
				'[data-block-name="poocommerce/product-gallery-large-image"]'
			);

			await expect( async () => {
				await page.reload();

				const largeImageBox = await largeImageBlock.boundingBox();
				const thumbnailsBox = await thumbnailsBlock.boundingBox();
				const largeImageWidth = largeImageBox?.width ?? 0;
				const thumbnailsWidth = thumbnailsBox?.width ?? 0;

				expect( thumbnailsWidth ).toBeCloseTo(
					largeImageWidth * 0.1,
					0
				);
			} ).toPass( { timeout: 3_000 } );
		} );
	} );

	test( 'thumbnails are scrollable and last thumbnail is reachable', async ( {
		page,
		editor,
	} ) => {
		await test.step( 'in editor', async () => {
			const largeImageBlock = editor.canvas.locator(
				'[data-type="poocommerce/product-gallery-large-image"]'
			);
			const thumbnailsBlock = editor.canvas.locator(
				'[data-type="poocommerce/product-gallery-thumbnails"]'
			);
			const thumbnailsSizeInput = page.getByLabel( 'Thumbnail Size' );

			// Open block settings
			await thumbnailsBlock.click();
			await editor.openDocumentSettingsSidebar();

			await expect( thumbnailsSizeInput ).toHaveValue( '25' );
			await expect( async () => {
				// Set size to 10%
				await thumbnailsSizeInput.fill( '50' );

				const largeImageBox = await largeImageBlock.boundingBox();
				const thumbnailsBox = await thumbnailsBlock.boundingBox();
				const largeImageWidth = largeImageBox?.width ?? 0;
				const thumbnailsWidth = thumbnailsBox?.width ?? 0;

				expect( thumbnailsWidth ).toBeCloseTo(
					largeImageWidth * 0.5,
					0
				);
			} ).toPass( { timeout: 3_000 } );

			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );
		} );

		await test.step( 'in frontend', async () => {
			await page.goto( '/product/hoodie/' );

			const thumbnailsContainer = page.locator(
				'[data-block-name="poocommerce/product-gallery-thumbnails"]'
			);

			const scrollableContainer = page.locator(
				'.wc-block-product-gallery-thumbnails__scrollable'
			);

			const thumbnails = scrollableContainer.locator(
				'.wc-block-product-gallery-thumbnails__thumbnail'
			);

			// Get the last thumbnail
			const lastThumbnail = thumbnails.last();

			await expect( async () => {
				await page.reload();
				// Check if overflow classes are present initially
				await expect( thumbnailsContainer ).toHaveClass(
					/wc-block-product-gallery-thumbnails--overflow-bottom/
				);

				// Scroll to the last thumbnail
				await lastThumbnail.scrollIntoViewIfNeeded();

				// Verify the last thumbnail is visible
				await expect( lastThumbnail ).toBeVisible();

				// After scrolling to the end, the bottom overflow should be gone
				await expect( thumbnailsContainer ).not.toHaveClass(
					/wc-block-product-gallery-thumbnails--overflow-bottom/
				);
			} ).toPass( { timeout: 3_000 } );
		} );
	} );
} );
