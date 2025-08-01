/**
 * External dependencies
 */
import { test, expect, wpCLI } from '@poocommerce/e2e-utils';

test.describe( 'Legacy templates', () => {
	test( 'poocommerce//* slug is supported', async ( {
		admin,
		page,
		editor,
	} ) => {
		const template = {
			id: 'single-product',
			name: 'Single Product',
			customText: 'This is a customized template.',
			frontendPath: '/product/hoodie/',
		};

		await test.step( 'Customize existing template to create DB entry', async () => {
			await admin.visitSiteEditor( {
				postId: `poocommerce/poocommerce//${ template.id }`,
				postType: 'wp_template',
				canvas: 'edit',
			} );

			const title = editor.canvas.getByText( 'Title' ).first();

			await title.click();
			await title.press( 'Enter' );

			const emptyBlock = editor.canvas
				.getByLabel( 'Empty block' )
				.first();

			await emptyBlock.fill( template.customText );
			await page.keyboard.press( 'Escape' );

			await expect(
				editor.canvas.getByText( template.customText )
			).toBeVisible();

			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );
		} );

		await test.step( 'Update created term to legacy format in the DB', async () => {
			await wpCLI(
				`term update wp_theme poocommerce-poocommerce \
					--by="slug" \
					--name="poocommerce" \
					--slug="poocommerce"`
			);
		} );

		await test.step( 'Verify the template can be edited via a legacy ID ', async () => {
			await admin.visitSiteEditor( {
				postId: `poocommerce//${ template.id }`,
				postType: 'wp_template',
				canvas: 'edit',
			} );

			await expect(
				editor.canvas.getByText( template.customText )
			).toBeVisible();
		} );

		await test.step( 'Verify the template is listed in the Site Editor UI', async () => {
			await admin.visitSiteEditor( {
				postType: 'wp_template',
			} );

			await page.getByPlaceholder( 'Search' ).fill( template.name );

			await expect(
				page.getByRole( 'button', { name: template.name } ).first()
			).toBeVisible();
		} );

		await test.step( 'Verify the template loads correctly in the frontend', async () => {
			await page.goto( template.frontendPath );

			await expect( page.getByText( template.customText ) ).toBeVisible();
		} );
	} );
} );
