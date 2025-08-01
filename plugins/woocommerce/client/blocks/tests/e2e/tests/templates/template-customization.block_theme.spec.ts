/**
 * External dependencies
 */
import {
	test,
	expect,
	BLOCK_THEME_WITH_TEMPLATES_SLUG,
} from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import { CUSTOMIZABLE_WC_TEMPLATES } from './constants';

test.describe( 'Template customization', () => {
	CUSTOMIZABLE_WC_TEMPLATES.forEach( ( testData ) => {
		const userText = `Hello World in the ${ testData.templateName } template`;
		const fallbackTemplateUserText = `Hello World in the fallback ${ testData.templateName } template`;
		const templateTypeName =
			testData.templateType === 'wp_template'
				? 'template'
				: 'template part';

		test( `"${ testData.templateName }" template can be modified and reverted`, async ( {
			admin,
			frontendUtils,
			editor,
			page,
			requestUtils,
		} ) => {
			await admin.visitSiteEditor( {
				postId: `poocommerce/poocommerce//${ testData.templatePath }`,
				postType: testData.templateType,
				canvas: 'edit',
			} );

			await editor.insertBlock( {
				name: 'core/paragraph',
				attributes: { content: userText },
			} );
			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );

			// Verify template name didn't change.
			// See: https://github.com/poocommerce/poocommerce/issues/42221
			await expect(
				page.getByRole( 'heading', {
					name: templateTypeName,
				} )
			).toBeVisible();

			await testData.visitPage( {
				admin,
				editor,
				frontendUtils,
				requestUtils,
				page,
			} );
			await expect( page.getByText( userText ).first() ).toBeVisible();

			// Verify the edition can be reverted.
			await admin.visitSiteEditor( {
				postType: testData.templateType,
			} );
			await editor.revertTemplate( {
				templateName: testData.templateName,
			} );
			await testData.visitPage( {
				admin,
				editor,
				frontendUtils,
				requestUtils,
				page,
			} );
			await expect( page.getByText( userText ) ).toBeHidden();
		} );

		if ( testData.fallbackTemplate ) {
			test( `"${ testData.templateName }" template defaults to the "${ testData.fallbackTemplate.templateName }" template`, async ( {
				admin,
				frontendUtils,
				requestUtils,
				editor,
				page,
			} ) => {
				// Edit fallback template and verify changes are visible.
				await admin.visitSiteEditor( {
					postId: `poocommerce/poocommerce//${ testData.fallbackTemplate?.templatePath }`,
					postType: testData.templateType,
					canvas: 'edit',
				} );

				await editor.insertBlock( {
					name: 'core/paragraph',
					attributes: {
						content: fallbackTemplateUserText,
					},
				} );
				await editor.saveSiteEditorEntities( {
					isOnlyCurrentEntityDirty: true,
				} );
				await testData.visitPage( {
					admin,
					editor,
					frontendUtils,
					requestUtils,
					page,
				} );
				await expect(
					page.getByText( fallbackTemplateUserText ).first()
				).toBeVisible();

				// Verify the edition can be reverted.
				await admin.visitSiteEditor( {
					postType: testData.templateType,
				} );
				await editor.revertTemplate( {
					templateName: testData.fallbackTemplate?.templateName || '',
				} );
				await testData.visitPage( {
					admin,
					editor,
					frontendUtils,
					requestUtils,
					page,
				} );
				await expect(
					page.getByText( fallbackTemplateUserText )
				).toBeHidden();
			} );
		}
	} );

	const testToRun = CUSTOMIZABLE_WC_TEMPLATES.filter(
		( data ) => data.canBeOverriddenByThemes
	);

	for ( const testData of testToRun ) {
		const userText = `Hello World in the ${ testData.templateName } template`;
		const poocommerceTemplateUserText = `Hello World in the PooCommerce ${ testData.templateName } template`;

		test( `user-modified "${ testData.templateName }" template based on the theme template has priority over the user-modified template based on the default PooCommerce template`, async ( {
			page,
			admin,
			editor,
			requestUtils,
			frontendUtils,
		} ) => {
			// Edit the PooCommerce default template
			await admin.visitSiteEditor( {
				postId: `poocommerce/poocommerce//${ testData.templatePath }`,
				postType: testData.templateType,
				canvas: 'edit',
			} );

			await editor.insertBlock( {
				name: 'core/paragraph',
				attributes: { content: poocommerceTemplateUserText },
			} );
			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );

			await requestUtils.activateTheme( BLOCK_THEME_WITH_TEMPLATES_SLUG );

			// Edit the theme template. The theme template is not
			// directly available from the UI, because the customized
			// one takes priority, so we go directly to its URL.
			await admin.visitSiteEditor( {
				postId: `${ BLOCK_THEME_WITH_TEMPLATES_SLUG }//${ testData.templatePath }`,
				postType: testData.templateType,
				canvas: 'edit',
			} );

			await editor.insertBlock( {
				name: 'core/paragraph',
				attributes: { content: userText },
			} );
			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );

			// Verify the template is the one modified by the user based on the theme.
			await testData.visitPage( {
				admin,
				editor,
				frontendUtils,
				requestUtils,
				page,
			} );
			await expect( page.getByText( userText ).first() ).toBeVisible();
			await expect(
				page.getByText( poocommerceTemplateUserText )
			).toBeHidden();

			// Revert edition and verify the user-modified WC template is used.
			// Note: we need to revert it from the admin (instead of calling
			// `deleteAllTemplates()`). This way, we verify there are no
			// duplicate templates with the same name.
			// See: https://github.com/poocommerce/poocommerce/issues/42220
			await admin.visitSiteEditor( {
				postType: testData.templateType,
			} );

			await editor.revertTemplate( {
				templateName: testData.templateName,
			} );

			await testData.visitPage( {
				admin,
				editor,
				frontendUtils,
				requestUtils,
				page,
			} );

			await expect(
				page.getByText( poocommerceTemplateUserText ).first()
			).toBeVisible();
			await expect( page.getByText( userText ) ).toBeHidden();
		} );
	}
} );
