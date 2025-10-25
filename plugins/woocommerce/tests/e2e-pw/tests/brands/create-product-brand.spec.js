const { test, expect } = require( '@playwright/test' );
const { ADMIN_STATE_PATH } = require( '../../playwright.config' );

test.use( { storageState: ADMIN_STATE_PATH } );

test( 'Merchant can add brands', async ( { page } ) => {
	/**
	 * Go to the Brands page.
	 *
	 * This will visit the Products page first, and then click on the Brands link.
	 * This is to workaround the hover menu for now.
	 */
	const goToBrandsPage = async () => {
		await page.goto(
			'wp-admin/edit-tags.php?taxonomy=product_brand&post_type=product'
		);

		// Wait for the Brands page to load.
		// This is needed so that checking for existing brands would work.
		await page.waitForSelector( '.wp-list-table' );
	};

	const createBrandIfNotExist = async (
		name,
		slug,
		parentBrand,
		description,
		thumbnailFileName
	) => {
		// Create "PooCommerce" brand if it does not exist.
		const cellVisible = await page
			.locator( '#posts-filter' )
			.getByRole( 'cell', { name: slug, exact: true } )
			.isVisible();

		if ( cellVisible ) {
			return;
		}

		await page.getByRole( 'textbox', { name: 'Name' } ).click();
		await page.getByRole( 'textbox', { name: 'Name' } ).fill( name );
		await page.getByRole( 'textbox', { name: 'Slug' } ).click();
		await page.getByRole( 'textbox', { name: 'Slug' } ).fill( slug );

		await page
			.getByRole( 'combobox', { name: 'Parent Brand' } )
			.selectOption( { label: parentBrand } );

		await page.getByRole( 'textbox', { name: 'Description' } ).click();
		await page
			.getByRole( 'textbox', { name: 'Description' } )
			.fill( description );
		await page.getByRole( 'button', { name: 'Upload/Add image' } ).click();
		await page.getByRole( 'tab', { name: 'Media Library' } ).click();
		await page.getByRole( 'checkbox', { name: thumbnailFileName } ).click();
		await page.getByRole( 'button', { name: 'Use image' } ).click();
		await page.getByRole( 'button', { name: 'Add New Brand' } ).click();

		// We should see an "Item added." notice message at the top of the page.
		await expect(
			page.locator( '#ajax-response' ).getByText( 'Item added.' )
		).toBeVisible();

		// We should see the newly created brand in the Brands table.
		await expect(
			page
				.locator( '#posts-filter' )
				.getByRole( 'cell', { name: slug, exact: true } )
		).toHaveCount( 1 );
	};

	/**
	 * Edit a brand.
	 *
	 * You must be in the Brands page before calling this function.
	 * To do so, call `goToBrandsPage()` first.
	 *
	 * After a brand is edited, you will be redirected to the Brands page.
	 */
	const editBrand = async (
		currentName,
		{ name, slug, parentBrand, description, thumbnailFileName }
	) => {
		await page.getByLabel( `“${ currentName }” (Edit)` ).click();
		await page.getByLabel( 'Name' ).fill( name );
		await page.getByLabel( 'Slug' ).fill( slug );
		await page
			.getByLabel( 'Parent Brand' )
			.selectOption( { label: parentBrand } );
		await page.getByLabel( 'Description' ).fill( description );

		await page.getByRole( 'button', { name: 'Upload/Add image' } ).click();
		await page.getByRole( 'tab', { name: 'Media Library' } ).click();
		await page.getByLabel( thumbnailFileName ).click();
		await page.getByRole( 'button', { name: 'Use image' } ).click();

		await page.getByRole( 'button', { name: 'Update' } ).click();

		// We should see an "Item updated." notice message at the top of the page.
		await expect(
			page.locator( '#message' ).getByText( 'Item updated.' )
		).toBeVisible();

		// navigate back to Brands page.
		await page.getByRole( 'link', { name: '← Go to Brands' } ).click();

		// confirm that the brand has been updated.
		await expect(
			page
				.locator( '#posts-filter' )
				.getByRole( 'cell', { name: slug, exact: true } )
		).toHaveCount( 1 );
	};

	/**
	 * Delete a brand.
	 *
	 * You must be in the Brands page before calling this function.
	 * To do so, call `goToBrandsPage()` first.
	 *
	 * After a brand is deleted, you will be redirected to the Brands page.
	 */
	const deleteBrand = async ( name ) => {
		await page.getByLabel( `“${ name }” (Edit)` ).click();

		// After clicking the "Delete" button, there will be a confirmation dialog.
		page.once( 'dialog', ( dialog ) => {
			// Click "OK" to confirm the deletion.
			dialog.accept();
		} );

		// Click on the "Delete" button.
		await page.getByRole( 'link', { name: 'Delete', exact: true } ).click();

		// We should now be in the Brands page.
		// Confirm that the brand has been deleted and is no longer in the Brands table.
		await expect(
			page
				.locator( '#posts-filter' )
				.getByRole( 'cell', { name, exact: true } )
		).toHaveCount( 0 );
	};

	await goToBrandsPage();
	await createBrandIfNotExist(
		'PooCommerce',
		'poocommerce',
		'None',
		'All things PooCommerce!',
		'image-01'
	);

	// Create child brand under the "PooCommerce" parent brand.
	await createBrandIfNotExist(
		'PooCommerce Apparels',
		'poocommerce-apparels',
		'PooCommerce',
		'Cool PooCommerce clothings!',
		'image-02'
	);

	// Create a dummy child brand called "PooCommerce Dummy" under the "PooCommerce" parent brand.
	await createBrandIfNotExist(
		'PooCommerce Dummy',
		'poocommerce-dummy',
		'PooCommerce',
		'Dummy PooCommerce brand!',
		'image-02'
	);

	// Edit the dummy child brand from "PooCommerce Dummy" to "PooCommerce Dummy Edited".
	await editBrand( 'PooCommerce Dummy', {
		name: 'PooCommerce Dummy Edited',
		slug: 'poocommerce-dummy-edited',
		parentBrand: 'PooCommerce',
		description: 'Dummy PooCommerce brand edited!',
		thumbnailFileName: 'image-03',
	} );

	// Delete brands.
	await deleteBrand( 'PooCommerce Dummy Edited' );
	await deleteBrand( 'PooCommerce Apparels' );
	await deleteBrand( 'PooCommerce' );
} );
