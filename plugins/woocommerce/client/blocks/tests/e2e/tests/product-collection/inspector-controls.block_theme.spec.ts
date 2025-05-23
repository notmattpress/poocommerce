/**
 * External dependencies
 */
import { test as base, expect } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import ProductCollectionPage, { SELECTORS } from './product-collection.page';

const test = base.extend< { pageObject: ProductCollectionPage } >( {
	pageObject: async ( { page, admin, editor }, use ) => {
		const pageObject = new ProductCollectionPage( {
			page,
			admin,
			editor,
		} );
		await use( pageObject );
	},
} );

test.describe( 'Product Collection: Inspector Controls', () => {
	test( 'Reflects the correct number of columns according to sidebar settings', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await pageObject.setNumberOfColumns( 2 );
		await expect( pageObject.productTemplate ).toHaveClass( /columns-2/ );

		await pageObject.setNumberOfColumns( 4 );
		await expect( pageObject.productTemplate ).toHaveClass( /columns-4/ );

		await pageObject.publishAndGoToFrontend();

		await expect( pageObject.productTemplate ).toHaveClass( /columns-4/ );
	} );

	test( 'Order By - sort products by title in descending order correctly', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		const sortedTitles = [
			'WordPress Pennant',
			'V-Neck T-Shirt',
			'T-Shirt with Logo',
			'T-Shirt',
			/Sunglasses/, // In the frontend it's "Protected: Sunglasses"
			'Single',
			'Polo',
			'Long Sleeve Tee',
			'Logo Collection',
		];

		await pageObject.setOrderBy( 'title/desc' );
		await expect( pageObject.productTitles ).toHaveText( sortedTitles );

		await pageObject.publishAndGoToFrontend();
		await expect( pageObject.productTitles ).toHaveText( sortedTitles );
	} );

	test( 'Products can be filtered based on "on sale" status', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		let allProducts = pageObject.products;
		let saleProducts = pageObject.products.filter( {
			hasText: 'Product on sale',
		} );

		await expect( allProducts ).toHaveCount( 9 );
		await expect( saleProducts ).toHaveCount( 6 );

		await pageObject.setShowOnlyProductsOnSale( {
			onSale: true,
		} );

		await expect( allProducts ).toHaveCount( 6 );
		await expect( saleProducts ).toHaveCount( 6 );

		await pageObject.publishAndGoToFrontend();
		await pageObject.refreshLocators( 'frontend' );
		allProducts = pageObject.products;
		saleProducts = pageObject.products.filter( {
			hasText: 'Product on sale',
		} );

		await expect( allProducts ).toHaveCount( 6 );
		await expect( saleProducts ).toHaveCount( 6 );
	} );

	test( 'Products can be filtered based on selection in handpicked products option', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await pageObject.addFilter( 'Show Hand-picked' );

		const filterName = 'Hand-picked';
		await pageObject.setFilterComboboxValue( filterName, [ 'Album' ] );
		await expect( pageObject.products ).toHaveCount( 1 );

		const productNames = [ 'Album', 'Cap' ];
		await pageObject.setFilterComboboxValue( filterName, productNames );
		await expect( pageObject.products ).toHaveCount( 2 );
		await expect( pageObject.productTitles ).toHaveText( productNames );

		await pageObject.publishAndGoToFrontend();
		await expect( pageObject.products ).toHaveCount( 2 );
		await expect( pageObject.productTitles ).toHaveText( productNames );
	} );

	test( 'Products can be filtered based on keyword.', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await pageObject.addFilter( 'Keyword' );

		await pageObject.setKeyword( 'Album' );
		await expect( pageObject.productTitles ).toHaveText( [ 'Album' ] );

		await pageObject.setKeyword( 'Cap' );
		await expect( pageObject.productTitles ).toHaveText( [ 'Cap' ] );

		await pageObject.publishAndGoToFrontend();
		await expect( pageObject.productTitles ).toHaveText( [ 'Cap' ] );
	} );

	test( 'Products can be filtered based on category.', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		const filterName = 'Product categories';
		await pageObject.addFilter( 'Show product categories' );
		await pageObject.setFilterComboboxValue( filterName, [ 'Clothing' ] );
		await expect( pageObject.productTitles ).toHaveText( [
			'Logo Collection',
		] );

		await pageObject.setFilterComboboxValue( filterName, [
			'Accessories',
		] );
		const accessoriesProductNames = [
			'Beanie',
			'Beanie with Logo',
			'Belt',
			'Cap',
			'Sunglasses',
		];
		await expect( pageObject.productTitles ).toHaveText(
			accessoriesProductNames
		);

		await pageObject.publishAndGoToFrontend();

		const frontendAccessoriesProductNames = [
			'Beanie',
			'Beanie with Logo',
			'Belt',
			'Cap',
			'Protected: Sunglasses',
		];
		await expect( pageObject.productTitles ).toHaveText(
			frontendAccessoriesProductNames
		);
	} );

	test( 'Products can be filtered based on tags.', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		const filterName = 'Product tags';
		await pageObject.addFilter( 'Show product tags' );
		await pageObject.setFilterComboboxValue( filterName, [
			'Recommended',
		] );
		await expect( pageObject.productTitles ).toHaveText( [
			'Beanie',
			'Hoodie',
		] );

		await pageObject.publishAndGoToFrontend();
		await expect( pageObject.productTitles ).toHaveText( [
			'Beanie',
			'Hoodie',
		] );
	} );

	test( 'Products can be filtered based on product attributes like color, size etc.', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await pageObject.addFilter( 'Show Product Attributes' );
		await pageObject.setProductAttribute( 'Color', 'Green' );

		await expect( pageObject.products ).toHaveCount( 3 );

		await pageObject.setProductAttribute( 'Size', 'Large' );

		await expect( pageObject.products ).toHaveCount( 1 );

		await pageObject.publishAndGoToFrontend();

		await expect( pageObject.products ).toHaveCount( 1 );
	} );

	test( 'Products can be filtered based on stock status (in stock, out of stock, or backorder).', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await pageObject.setFilterComboboxValue( 'Stock status', [
			'Out of stock',
		] );

		await expect( pageObject.productTitles ).toHaveText( [
			'T-Shirt with Logo',
		] );

		await pageObject.publishAndGoToFrontend();

		await expect( pageObject.productTitles ).toHaveText( [
			'T-Shirt with Logo',
		] );
	} );

	test( 'Products can be filtered based on featured status.', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await expect( pageObject.products ).toHaveCount( 9 );

		await pageObject.addFilter( 'Featured' );
		await pageObject.setShowOnlyFeaturedProducts( {
			featured: true,
		} );

		// In test data we have only 4 featured products.
		await expect( pageObject.products ).toHaveCount( 4 );

		await pageObject.publishAndGoToFrontend();

		await expect( pageObject.products ).toHaveCount( 4 );
	} );

	test( 'Products can be filtered based on created date.', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await expect( pageObject.products ).toHaveCount( 9 );

		await pageObject.addFilter( 'Created' );
		await pageObject.setCreatedFilter( {
			operator: 'within',
			range: 'last3months',
		} );

		// Products are created with the fixed publish date back in 2019
		// so there's no products published in last 3 months.
		await expect( pageObject.products ).toHaveCount( 0 );

		await pageObject.setCreatedFilter( {
			operator: 'before',
			range: 'last3months',
		} );

		await expect( pageObject.products ).toHaveCount( 9 );

		await pageObject.publishAndGoToFrontend();

		await expect( pageObject.products ).toHaveCount( 9 );
	} );

	test( 'Products can be filtered based on price range.', async ( {
		pageObject,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await expect( pageObject.products ).toHaveCount( 9 );

		await pageObject.addFilter( 'Price Range' );
		await pageObject.setPriceRange( {
			min: '25',
		} );

		await expect( pageObject.products ).toHaveCount( 7 );

		await pageObject.setPriceRange( {
			min: '15.28',
			max: '17.21',
		} );

		await expect( pageObject.products ).toHaveCount( 2 );

		await pageObject.setPriceRange( {
			max: '17.29',
		} );

		await expect( pageObject.products ).toHaveCount( 5 );

		await pageObject.publishAndGoToFrontend();

		await expect( pageObject.products ).toHaveCount( 5 );
	} );

	// See https://github.com/poocommerce/poocommerce/pull/49917
	test( 'Price range is inclusive in both editor and frontend.', async ( {
		page,
		pageObject,
		editor,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		await expect( pageObject.products ).toHaveCount( 9 );

		await pageObject.addFilter( 'Price Range' );
		await pageObject.setPriceRange( {
			min: '45',
			max: '55',
		} );

		// Wait for the products to be filtered.
		await expect( pageObject.products ).not.toHaveCount( 9 );

		await expect(
			pageObject.products.filter( { hasText: '$45.00' } )
		).not.toHaveCount( 0 );
		await expect(
			pageObject.products.filter( { hasText: '$55.00' } )
		).not.toHaveCount( 0 );

		// Reset the price range.
		await pageObject.setPriceRange( {
			min: '0',
			max: '0',
		} );

		await expect( pageObject.products ).toHaveCount( 9 );

		await editor.insertBlock( {
			name: 'poocommerce/filter-wrapper',
			attributes: { filterType: 'price-filter' },
		} );

		await pageObject.publishAndGoToFrontend();

		await expect( pageObject.products ).toHaveCount( 9 );

		await page
			.getByRole( 'textbox', {
				name: 'Filter products by minimum',
			} )
			.dblclick();
		await page.keyboard.type( '45' );

		await page
			.getByRole( 'textbox', {
				name: 'Filter products by maximum',
			} )
			.dblclick();
		await page.keyboard.type( '55' );

		await page.keyboard.press( 'Tab' );

		// Wait for the products to be filtered.
		await expect( pageObject.products ).not.toHaveCount( 9 );

		await expect(
			pageObject.products.filter( { hasText: '$45.00' } )
		).not.toHaveCount( 0 );
		await expect(
			pageObject.products.filter( { hasText: '$55.00' } )
		).not.toHaveCount( 0 );
	} );

	test.describe( '"Query Type" control', () => {
		test( 'should be visible on posts', async ( { pageObject } ) => {
			await pageObject.createNewPostAndInsertBlock();

			await expect(
				pageObject
					.locateSidebarSettings()
					.getByLabel( SELECTORS.usePageContextControl )
			).toBeVisible();
		} );

		[
			'poocommerce/poocommerce//archive-product',
			'poocommerce/poocommerce//taxonomy-product_cat',
			'poocommerce/poocommerce//taxonomy-product_tag',
			'poocommerce/poocommerce//taxonomy-product_attribute',
			'poocommerce/poocommerce//product-search-results',
		].forEach( ( slug ) => {
			test( `should be visible in archive template: ${ slug }`, async ( {
				pageObject,
				editor,
			} ) => {
				await pageObject.goToEditorTemplate( slug );
				await pageObject.insertProductCollection();
				await pageObject.chooseCollectionInTemplate();
				await pageObject.focusProductCollection();
				await editor.openDocumentSettingsSidebar();

				await expect(
					pageObject
						.locateSidebarSettings()
						.getByLabel( SELECTORS.usePageContextControl )
				).toBeVisible();
			} );
		} );

		[
			'poocommerce/poocommerce//single-product',
			'twentytwentyfour//home',
			'twentytwentyfour//index',
		].forEach( ( slug ) => {
			test( `should be visible in non-archive template: ${ slug }`, async ( {
				pageObject,
				editor,
			} ) => {
				await pageObject.goToEditorTemplate( slug );
				await pageObject.insertProductCollection();
				await pageObject.chooseCollectionInTemplate();
				await pageObject.focusProductCollection();
				await editor.openDocumentSettingsSidebar();

				await expect(
					pageObject
						.locateSidebarSettings()
						.getByLabel( SELECTORS.usePageContextControl )
				).toBeVisible();
			} );
		} );

		test( 'should work as expected in Product Catalog template', async ( {
			pageObject,
			editor,
		} ) => {
			await pageObject.goToEditorTemplate();
			await pageObject.focusProductCollection();
			await editor.openDocumentSettingsSidebar();

			const sidebarSettings = pageObject.locateSidebarSettings();
			const queryTypeLocator = sidebarSettings.getByLabel(
				SELECTORS.usePageContextControl
			);

			const defaultQueryType = queryTypeLocator.getByLabel( 'Default' );
			const customQueryType = queryTypeLocator.getByLabel( 'Custom' );

			// Inherit query from template should be visible & enabled by default
			await expect( defaultQueryType ).toBeChecked();

			// "On sale control" should be hidden when inherit query from template is enabled
			await expect(
				sidebarSettings.getByLabel( SELECTORS.onSaleControlLabel )
			).toBeHidden();

			// "On sale control" should be visible when inherit query from template is disabled
			await customQueryType.click();
			await expect(
				sidebarSettings.getByLabel( SELECTORS.onSaleControlLabel )
			).toBeVisible();

			// "On sale control" should retain its state when inherit query from template is enabled again
			await pageObject.setShowOnlyProductsOnSale( {
				onSale: true,
				isLocatorsRefreshNeeded: false,
			} );
			await expect(
				sidebarSettings.getByLabel( SELECTORS.onSaleControlLabel )
			).toBeChecked();
			await defaultQueryType.click();
			await expect(
				sidebarSettings.getByLabel( SELECTORS.onSaleControlLabel )
			).toBeHidden();
			await customQueryType.click();
			await expect(
				sidebarSettings.getByLabel( SELECTORS.onSaleControlLabel )
			).toBeVisible();
			await expect(
				sidebarSettings.getByLabel( SELECTORS.onSaleControlLabel )
			).toBeChecked();
		} );

		test( 'is enabled by default unless already enabled elsewhere', async ( {
			pageObject,
			editor,
		} ) => {
			const productCollection = editor.canvas.getByLabel(
				'Block: Product Collection',
				{ exact: true }
			);
			const sidebarSettings = pageObject.locateSidebarSettings();
			const queryTypeLocator = sidebarSettings.getByLabel(
				SELECTORS.usePageContextControl
			);

			const defaultQueryType = queryTypeLocator.getByLabel( 'Default' );
			const customQueryType = queryTypeLocator.getByLabel( 'Custom' );

			// First Product Catalog
			// Option should be visible & ENABLED by default
			await pageObject.goToEditorTemplate();
			await editor.selectBlocks( productCollection.first() );
			await editor.openDocumentSettingsSidebar();

			await expect( defaultQueryType ).toBeChecked();
			await expect( customQueryType ).not.toBeChecked();

			// Second Product Catalog
			// Option should be visible & DISABLED by default
			await pageObject.insertProductCollection();
			await pageObject.chooseCollectionInTemplate( 'productCatalog' );
			await editor.selectBlocks( productCollection.last() );

			await expect( defaultQueryType ).not.toBeChecked();
			await expect( customQueryType ).toBeChecked();

			// Disable the option in the first Product Catalog
			await editor.selectBlocks( productCollection.first() );
			await customQueryType.click();

			// Third Product Catalog
			// Option should be visible & ENABLED by default
			await pageObject.insertProductCollection();
			await pageObject.chooseCollectionInTemplate( 'productCatalog' );
			await editor.selectBlocks( productCollection.last() );

			await expect( defaultQueryType ).toBeChecked();
			await expect( customQueryType ).not.toBeChecked();
		} );

		test( 'allows filtering in non-archive context', async ( {
			pageObject,
			editor,
			page,
			requestUtils,
		} ) => {
			await requestUtils.setFeatureFlag( 'experimental-blocks', true );
			await pageObject.createNewPostAndInsertBlock();

			await expect( pageObject.products ).toHaveCount( 9 );

			await pageObject.insertProductCollection();
			await pageObject.chooseCollectionInPost( 'productCatalog' );

			await expect( pageObject.products ).toHaveCount( 18 );

			const productCollectionBlock = await editor.getBlockByName(
				'poocommerce/product-collection'
			);
			const productCollectionClientId =
				( await productCollectionBlock
					.last()
					.getAttribute( 'data-block' ) ) ?? '';
			await editor.insertBlock(
				{ name: 'poocommerce/product-filters' },
				{ clientId: productCollectionClientId }
			);

			const postId = await editor.publishPost();
			await page.goto( `/?p=${ postId }` );

			const productCollection = page.locator(
				'.wp-block-poocommerce-product-collection'
			);

			await expect(
				productCollection.first().locator( SELECTORS.product )
			).toHaveCount( 9 );
			await expect(
				productCollection.last().locator( SELECTORS.product )
			).toHaveCount( 9 );

			await page
				.getByRole( 'textbox', {
					name: 'Filter products by maximum price',
				} )
				.dblclick();
			await page.keyboard.type( '10' );
			await page.keyboard.press( 'Tab' );

			await expect(
				productCollection.first().locator( SELECTORS.product )
			).toHaveCount( 1 );
			await expect(
				productCollection.last().locator( SELECTORS.product )
			).toHaveCount( 9 );
		} );

		test( 'correctly combines editor and front-end filters', async ( {
			pageObject,
			editor,
			page,
			requestUtils,
		} ) => {
			await requestUtils.setFeatureFlag( 'experimental-blocks', true );

			await pageObject.createNewPostAndInsertBlock();

			await expect( pageObject.products ).toHaveCount( 9 );

			await pageObject.addFilter( 'Show product categories' );
			await pageObject.setFilterComboboxValue( 'Product categories', [
				'Music',
			] );

			const productCollectionBlock = await editor.getBlockByName(
				'poocommerce/product-collection'
			);
			const productCollectionClientId =
				( await productCollectionBlock
					.last()
					.getAttribute( 'data-block' ) ) ?? '';
			await editor.insertBlock(
				{ name: 'poocommerce/product-filters' },
				{ clientId: productCollectionClientId }
			);

			await expect( pageObject.products ).toHaveCount( 2 );

			const postId = await editor.publishPost();
			await page.goto( `/?p=${ postId }` );
			await pageObject.refreshLocators( 'frontend' );

			await expect( pageObject.products ).toHaveCount( 2 );

			await page
				.getByRole( 'textbox', {
					name: 'Filter products by maximum price',
				} )
				.dblclick();
			await page.keyboard.type( '5' );
			await page.keyboard.press( 'Tab' );

			await expect( pageObject.products ).toHaveCount( 1 );
		} );
	} );

	test( 'Display -> Items per page, offset & max page to show', async ( {
		pageObject,
		page,
		editor,
	} ) => {
		await pageObject.createNewPostAndInsertBlock();

		// Add all display controls
		await page.getByRole( 'button', { name: 'Settings options' } ).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Offset' } ).click();
		await page
			.getByRole( 'menuitemcheckbox', { name: 'Max pages to show' } )
			.click();
		await page.getByRole( 'button', { name: 'Settings options' } ).click();

		// Get the products per page input
		const settingsPanel = page.locator(
			'.wc-block-editor-product-collection__settings_panel'
		);
		const productsPerPageInput = settingsPanel.getByRole( 'spinbutton', {
			name: 'Products per page',
		} );

		// Test setting products per page to 2
		await productsPerPageInput.fill( '2' );
		await pageObject.refreshLocators( 'editor' );
		await expect( pageObject.products ).toHaveCount( 2 );

		// Test setting products per page to 3
		await productsPerPageInput.fill( '3' );
		await pageObject.refreshLocators( 'editor' );
		await expect( pageObject.products ).toHaveCount( 3 );

		// Set offset to 1 and verify it skips the first product
		const offsetInput = settingsPanel.getByRole( 'spinbutton', {
			name: 'Offset',
		} );
		await offsetInput.fill( '1' );
		const loadingSpinner = editor.canvas.locator(
			'.wc-block-product-template__spinner'
		);
		await expect( loadingSpinner ).toBeHidden();
		await pageObject.refreshLocators( 'editor' );
		await expect( pageObject.productTitles.first() ).toHaveText( 'Beanie' );

		// Set max pages to show
		const maxPagesInput = settingsPanel.getByRole( 'spinbutton', {
			name: 'Max pages to show',
		} );
		await maxPagesInput.fill( '2' );

		await pageObject.publishAndGoToFrontend();

		// Frontend: Verify products are displayed correctly
		await expect( pageObject.products ).toHaveCount( 3 );
		await expect( pageObject.productTitles.first() ).toHaveText( 'Beanie' );

		// Frontend: Verify pagination is limited to 2 pages
		const paginationContainer = page.locator(
			SELECTORS.pagination.onFrontend
		);
		const paginationNumbers =
			paginationContainer.locator( '.page-numbers' );
		await expect( paginationNumbers ).toHaveCount( 2 );
	} );
} );
