/**
 * External dependencies
 */
import { FrameLocator, Locator, Page } from '@playwright/test';
import { Editor, Admin } from '@poocommerce/e2e-utils';
import { BlockRepresentation } from '@wordpress/e2e-test-utils-playwright/build-types/editor/insert-block';

/**
 * Internal dependencies
 */
import { BLOCK_THEME_SLUG } from '../../utils/constants';

export const BLOCK_LABELS = {
	productTemplate: 'Block: Product Template',
	pagination: 'Block: Pagination',
	productImage: 'Block: Product Image',
};

export const SELECTORS = {
	productTemplate: '.wc-block-product-template',
	product: '.wc-block-product-template .wc-block-product',
	productImage: {
		inEditor: '[data-type="poocommerce/product-image"]',
		onFrontend: '[data-block-name="poocommerce/product-image"]',
	},
	productTitle: '.wp-block-post-title',
	productPrice: {
		inEditor: '[data-type="poocommerce/product-price"]',
		onFrontend: '[data-block-name="poocommerce/product-price"]',
	},
	addToCartButton: {
		inEditor: '[data-type="poocommerce/product-button"]',
		onFrontend: '[data-block-name="poocommerce/product-button"]',
	},
	pagination: {
		inEditor: '[data-type="core/query-pagination"]',
		onFrontend: '.wp-block-query-pagination',
	},
	onSaleControlLabel: 'Show only products on sale',
	featuredControlLabel: 'Show only featured products',
	usePageContextControl: 'Query type',
	shrinkColumnsToFit: 'Responsive',
	productSearchLabel: 'Search',
	productSearchButton: '.wp-block-search__button wp-element-button',
	createdFilter: {
		operator: {
			within: 'Within',
			before: 'Before',
		},
		range: {
			last24hours: 'last 24 hours',
			last7days: 'last 7 days',
			last30days: 'last 30 days',
			last3months: 'last 3 months',
		},
	},
	priceRangeFilter: {
		min: 'MIN',
		max: 'MAX',
	},
	previewButtonTestID: 'product-collection-preview-button',
	collectionPlaceholder:
		'[data-type="poocommerce/product-collection"] .components-placeholder',
	productPicker: '.wc-blocks-product-collection__editor-product-picker',
	linkedProductControl: {
		button: '.wc-block-product-collection-linked-product-control__button',
		popoverContent:
			'.wc-block-product-collection-linked-product__popover-content',
	},
};

export type Collections =
	| 'newArrivals'
	| 'topRated'
	| 'bestSellers'
	| 'onSale'
	| 'featured'
	| 'relatedProducts'
	| 'productCatalog'
	| 'myCustomCollection'
	| 'myCustomCollectionWithPreview'
	| 'myCustomCollectionWithAdvancedPreview'
	| 'myCustomCollectionWithProductContext'
	| 'myCustomCollectionWithOrderContext'
	| 'myCustomCollectionWithCartContext'
	| 'myCustomCollectionWithArchiveContext'
	| 'myCustomCollectionMultipleContexts'
	| 'myCustomCollectionWithInserterScope'
	| 'myCustomCollectionWithBlockScope';

const collectionToButtonNameMap = {
	newArrivals: 'New Arrivals',
	topRated: 'Top Rated Products',
	bestSellers: 'Best Sellers',
	onSale: 'On Sale Products',
	featured: 'Featured Products',
	relatedProducts: 'Related Products',
	productCatalog: 'create your own',
	myCustomCollection: 'My Custom Collection',
	myCustomCollectionWithPreview: 'My Custom Collection with Preview',
	myCustomCollectionWithAdvancedPreview:
		'My Custom Collection with Advanced Preview',
	myCustomCollectionWithProductContext:
		'My Custom Collection - Product Context',
	myCustomCollectionWithOrderContext: 'My Custom Collection - Order Context',
	myCustomCollectionWithCartContext: 'My Custom Collection - Cart Context',
	myCustomCollectionWithArchiveContext:
		'My Custom Collection - Archive Context',
	myCustomCollectionMultipleContexts:
		'My Custom Collection - Multiple Contexts',
	myCustomCollectionWithInserterScope:
		'My Custom Collection - With Inserter Scope',
	myCustomCollectionWithBlockScope: 'My Custom Collection - With Block Scope',
};

class ProductCollectionPage {
	private BLOCK_SLUG = 'poocommerce/product-collection';
	private page: Page;
	private admin: Admin;
	private editor: Editor;
	BLOCK_NAME = 'Product Collection';
	productTemplate!: Locator;
	products!: Locator;
	productImages!: Locator;
	productTitles!: Locator;
	productPrices!: Locator;
	addToCartButtons!: Locator;
	pagination!: Locator;

	constructor( {
		page,
		admin,
		editor,
	}: {
		page: Page;
		admin: Admin;
		editor: Editor;
	} ) {
		this.page = page;
		this.admin = admin;
		this.editor = editor;
	}

	async chooseCollectionInPost( collection?: Collections ) {
		const buttonName = collection
			? collectionToButtonNameMap[ collection ]
			: collectionToButtonNameMap.productCatalog;

		const placeholderSelector = this.editor.canvas.locator(
			SELECTORS.collectionPlaceholder
		);

		const chooseCollectionFromPlaceholder = async () => {
			await placeholderSelector
				.getByRole( 'button', { name: buttonName, exact: true } )
				.click();
		};

		const chooseCollectionFromDropdown = async () => {
			await placeholderSelector
				.getByRole( 'button', {
					name: 'Choose collection',
				} )
				.click();

			await this.admin.page
				.locator(
					'.wc-blocks-product-collection__collections-dropdown-content'
				)
				.getByRole( 'button', { name: buttonName, exact: true } )
				.click();
		};

		await Promise.any( [
			chooseCollectionFromPlaceholder(),
			chooseCollectionFromDropdown(),
		] );
	}

	async chooseCollectionInTemplate( collection?: Collections ) {
		const buttonName = collection
			? collectionToButtonNameMap[ collection ]
			: collectionToButtonNameMap.productCatalog;

		const inserterClass = await this.editor.canvas
			.locator( SELECTORS.collectionPlaceholder )
			.locator(
				'.wc-blocks-product-collection__collections-grid, .wc-blocks-product-collection__collections-dropdown'
			)
			.getAttribute( 'class' );

		const isDropdown = inserterClass?.includes(
			'wc-blocks-product-collection__collections-dropdown'
		);

		if ( isDropdown ) {
			await this.editor.canvas
				.getByRole( 'button', { name: 'Choose collection' } )
				.click();

			await this.editor.canvas
				.locator(
					'.wc-blocks-product-collection__collections-dropdown-content'
				)
				.getByRole( 'button', { name: buttonName, exact: true } )
				.click();
		} else {
			await this.editor.canvas
				.locator( SELECTORS.collectionPlaceholder )
				.getByRole( 'button', { name: buttonName, exact: true } )
				.click();
		}
	}

	async chooseProductInEditorProductPickerIfAvailable(
		pageReference: Page | FrameLocator,
		productName = 'Album'
	) {
		const editorProductPicker = pageReference.locator(
			SELECTORS.productPicker
		);

		if ( await editorProductPicker.isVisible() ) {
			await editorProductPicker
				.locator( 'label' )
				.filter( {
					hasText: productName,
				} )
				.click();
		}
	}

	async createNewPostAndInsertBlock( collection?: Collections ) {
		await this.admin.createNewPost();
		await this.insertProductCollection();
		await this.chooseCollectionInPost( collection );
		// If product picker is available, choose a product.
		await this.chooseProductInEditorProductPickerIfAvailable(
			this.admin.page
		);
		await this.refreshLocators( 'editor' );
		await this.editor.openDocumentSettingsSidebar();
	}

	async setupAndFetchQueryContextURL( {
		collection,
	}: {
		collection: Collections;
	} ) {
		await this.admin.createNewPost();
		await this.insertProductCollection();

		const productResponsePromise = this.page.waitForResponse(
			( response ) => {
				return (
					response.url().includes( '/wp/v2/product' ) &&
					response
						.url()
						.includes( 'productCollectionQueryContext' ) &&
					response.status() === 200
				);
			}
		);

		await this.chooseCollectionInPost( collection );
		const productResponse = await productResponsePromise;

		return new URL( productResponse.url() );
	}
	async insertProductElements() {
		// By default there are inner blocks:
		// - poocommerce/product-image
		// - core/post-title
		// - poocommerce/product-price
		// - poocommerce/product-button
		// We're adding remaining ones
		const productElements = [
			{ name: 'poocommerce/product-rating', attributes: {} },
			{ name: 'poocommerce/product-sku', attributes: {} },
			{ name: 'poocommerce/product-stock-indicator', attributes: {} },
			{ name: 'poocommerce/product-sale-badge', attributes: {} },
			{
				name: 'core/post-excerpt',
				attributes: {
					__poocommerceNamespace:
						'poocommerce/product-collection/product-summary',
				},
			},
			{
				name: 'core/post-terms',
				attributes: { term: 'product_tag' },
			},
			{
				name: 'core/post-terms',
				attributes: { term: 'product_cat' },
			},
		];

		for ( const productElement of productElements ) {
			await this.insertBlockInProductCollection( productElement );
		}
	}

	async publishAndGoToFrontend() {
		const postId = await this.editor.publishPost();
		await this.page.goto( `/?p=${ postId }` );
		await this.refreshLocators( 'frontend' );
	}

	async replaceBlockByBlockName( name: string, nameToInsert: string ) {
		await this.page.evaluate(
			( { name: _name, nameToInsert: _nameToInsert } ) => {
				const blocks = window.wp.data
					.select( 'core/block-editor' )
					.getBlocks();
				const firstMatchingBlock = blocks
					.flatMap(
						( {
							innerBlocks,
						}: {
							innerBlocks: BlockRepresentation[];
						} ) => innerBlocks
					)
					.find(
						( block: BlockRepresentation ) => block.name === _name
					);
				const { clientId } = firstMatchingBlock;
				const block = window.wp.blocks.createBlock( _nameToInsert );
				window.wp.data
					.dispatch( 'core/block-editor' )
					.replaceBlock( clientId, block );
			},
			{ name, nameToInsert }
		);
	}

	// Going to Product Catalog by default
	async goToEditorTemplate(
		template = 'poocommerce/poocommerce//archive-product'
	) {
		await this.admin.visitSiteEditor( {
			postId: template,
			postType: 'wp_template',
			canvas: 'edit',
		} );
		await this.refreshLocators( 'editor' );
	}

	async goToProductCatalogAndInsertCollection( collection: Collections ) {
		await this.goToTemplateAndInsertCollection(
			'poocommerce/poocommerce//archive-product',
			collection
		);
	}

	async goToProductCatalogFrontend() {
		await this.page.goto( '/shop' );
		await this.refreshLocators( 'frontend' );
	}

	async goToHomePageFrontend() {
		await this.page.goto( `/` );
		await this.refreshLocators( 'frontend' );
	}

	async insertProductCollection() {
		await this.editor.insertBlock( { name: this.BLOCK_SLUG } );
	}

	async goToTemplateAndInsertCollection(
		template: string,
		collection?: Collections
	) {
		await this.admin.visitSiteEditor( {
			postId: template,
			postType: 'wp_template',
			canvas: 'edit',
		} );
		await this.editor.canvas.locator( 'body' ).click();
		await this.insertProductCollection();
		await this.chooseCollectionInTemplate( collection );
		// If product picker is available, choose a product.
		await this.chooseProductInEditorProductPickerIfAvailable(
			this.editor.canvas
		);
		await this.refreshLocators( 'editor' );
	}

	async goToHomePageAndInsertCollection( collection?: Collections ) {
		await this.goToTemplateAndInsertCollection(
			`${ BLOCK_THEME_SLUG }//home`,
			collection
		);
	}

	async searchProducts( phrase: string ) {
		await this.page
			.getByLabel( SELECTORS.productSearchLabel )
			.fill( phrase );
		await this.page.locator( SELECTORS.productSearchButton ).click();
	}

	async addFilter(
		name:
			| 'Show Hand-picked'
			| 'Keyword'
			| 'Show product categories'
			| 'Show product tags'
			| 'Show Product Attributes'
			| 'Featured'
			| 'Created'
			| 'Price Range'
	) {
		await this.page
			.getByRole( 'button', { name: 'Filters options' } )
			.click();
		await this.page
			.getByRole( 'menuitemcheckbox', {
				name,
			} )
			.click();
		await this.page
			.getByRole( 'button', { name: 'Filters options' } )
			.click();
	}

	async setNumberOfColumns( numberOfColumns: number ) {
		const sidebarSettings = this.locateSidebarSettings();
		const inputField = sidebarSettings.getByRole( 'spinbutton', {
			name: 'Columns',
		} );
		await inputField.fill( numberOfColumns.toString() );
	}

	async setOrderBy(
		orderBy:
			| 'title/asc'
			| 'title/desc'
			| 'date/desc'
			| 'date/asc'
			| 'popularity/desc'
			| 'rating/desc'
	) {
		const sidebarSettings = this.locateSidebarSettings();
		const orderByComboBox = sidebarSettings.getByRole( 'combobox', {
			name: 'Order by',
		} );
		await orderByComboBox.selectOption( orderBy );
		await this.editor.canvas.locator( SELECTORS.product ).first().waitFor();
		await this.refreshLocators( 'editor' );
	}

	async getOrderByElement() {
		const sidebarSettings = this.locateSidebarSettings();
		return sidebarSettings.getByRole( 'combobox', {
			name: 'Order by',
		} );
	}

	async getOrderBy() {
		const orderByComboBox = await this.getOrderByElement();
		return await orderByComboBox.inputValue();
	}

	async setShowOnlyProductsOnSale(
		{
			onSale,
			isLocatorsRefreshNeeded,
		}: {
			onSale: boolean;
			isLocatorsRefreshNeeded?: boolean;
		} = {
			isLocatorsRefreshNeeded: true,
			onSale: true,
		}
	) {
		const sidebarSettings = this.locateSidebarSettings();
		const input = sidebarSettings.getByLabel(
			SELECTORS.onSaleControlLabel
		);
		if ( onSale ) {
			await input.check();
		} else {
			await input.uncheck();
		}

		if ( isLocatorsRefreshNeeded ) await this.refreshLocators( 'editor' );
	}

	async setShowOnlyFeaturedProducts(
		{
			featured,
			isLocatorsRefreshNeeded,
		}: {
			featured: boolean;
			isLocatorsRefreshNeeded?: boolean;
		} = {
			featured: true,
			isLocatorsRefreshNeeded: true,
		}
	) {
		const sidebarSettings = this.locateSidebarSettings();
		const input = sidebarSettings.getByLabel(
			SELECTORS.featuredControlLabel
		);
		if ( featured ) {
			await input.check();
		} else {
			await input.uncheck();
		}

		if ( isLocatorsRefreshNeeded ) await this.refreshLocators( 'editor' );
	}

	async setCreatedFilter( {
		operator,
		range,
	}: {
		operator: 'within' | 'before';
		range: 'last24hours' | 'last7days' | 'last30days' | 'last3months';
	} ) {
		if ( ! operator || ! range ) {
			return false;
		}

		const operatorSelector = SELECTORS.createdFilter.operator[ operator ];
		const rangeSelector = SELECTORS.createdFilter.range[ range ];

		const sidebarSettings = this.locateSidebarSettings();
		const operatorButton = sidebarSettings.getByLabel( operatorSelector );
		const rangeButton = sidebarSettings.getByLabel( rangeSelector );

		await operatorButton.click();
		await rangeButton.click();
	}

	async setPriceRange( { min, max }: { min?: string; max?: string } = {} ) {
		const minInputSelector = SELECTORS.priceRangeFilter.min;
		const maxInputSelector = SELECTORS.priceRangeFilter.max;

		const sidebarSettings = this.locateSidebarSettings();
		const priceRangeContainer = sidebarSettings.locator(
			'.wc-block-product-price-range-control'
		);
		const minInput = priceRangeContainer.getByLabel( minInputSelector );
		const maxInput = priceRangeContainer.getByLabel( maxInputSelector );

		await minInput.fill( min || '' );
		await maxInput.fill( max || '' );
		// Value is applied on blur so it's required.
		await maxInput.blur();
	}

	async setFilterComboboxValue( filterName: string, filterValue: string[] ) {
		const sidebarSettings = this.locateSidebarSettings();
		const input = sidebarSettings.getByLabel( filterName );
		await input.click();

		// Clear the input field.
		let numberOfAlreadySelectedProducts = await input.evaluate(
			( node ) => {
				return node.parentElement?.children.length;
			}
		);
		while ( numberOfAlreadySelectedProducts ) {
			// Backspace will remove token
			await this.page.keyboard.press( 'Backspace' );
			numberOfAlreadySelectedProducts--;
		}

		// Add new values.
		for ( const name of filterValue ) {
			await input.pressSequentially( name );
			await sidebarSettings
				.getByRole( 'option', { name } )
				.getByText( name )
				.click();
		}

		await this.refreshLocators( 'editor' );
	}

	async setKeyword( keyword: string ) {
		const sidebarSettings = this.locateSidebarSettings();
		const input = sidebarSettings.getByLabel( 'Keyword' );
		await input.clear();
		await input.fill( keyword );
		await this.refreshLocators( 'editor' );
	}

	async focusProductCollection() {
		const editorSelector = this.editor.canvas
			.getByLabel( 'Block: Product Collection', { exact: true } )
			.first();

		const postSelector = this.page
			.getByLabel( 'Block: Product Collection', { exact: true } )
			.first();

		await Promise.any( [
			this.editor.selectBlocks( editorSelector ),
			this.editor.selectBlocks( postSelector ),
		] );
	}

	async changeCollectionUsingToolbar( collection: Collections ) {
		// Click "Choose collection" button in the toolbar.
		await this.admin.page
			.getByRole( 'toolbar', { name: 'Block Tools' } )
			.getByRole( 'button', { name: 'Choose collection' } )
			.click();

		// Select the collection from the modal.
		const collectionChooserModal = this.admin.page.locator(
			'.wc-blocks-product-collection__modal'
		);
		await collectionChooserModal
			.getByRole( 'button', {
				name: collectionToButtonNameMap[ collection ],
			} )
			.click();

		await collectionChooserModal
			.getByRole( 'button', {
				name: 'Continue',
			} )
			.click();
	}

	async setShrinkColumnsToFit( value = true ) {
		const sidebarSettings = this.locateSidebarSettings();
		const input = sidebarSettings.getByLabel(
			SELECTORS.shrinkColumnsToFit
		);
		if ( value ) {
			await input.check();
		} else {
			await input.uncheck();
		}
	}

	async setProductAttribute( attribute: 'Color' | 'Size', value: string ) {
		const sidebarSettings = this.locateSidebarSettings();

		const productAttributesContainer = sidebarSettings.locator(
			'.poocommerce-product-attributes'
		);

		// Whenever attributes filter is added, it fetched the attributes from the server.
		// So, we need to wait for the attributes to be fetched.
		await productAttributesContainer.getByLabel( 'Attributes' ).isEnabled();

		// If value is not visible, then toggle the attribute to make it visible.
		const isAttributeValueVisible =
			(
				await productAttributesContainer
					.getByLabel( value )
					.elementHandles()
			 ).length !== 0;
		if ( ! isAttributeValueVisible ) {
			await productAttributesContainer
				.locator( `li:has-text("${ attribute }")` )
				.click();
		}

		// Now, check the value.
		await productAttributesContainer.getByLabel( value ).check();
		await this.refreshLocators( 'editor' );
	}

	async setInheritQueryFromTemplate( inheritQueryFromTemplate: boolean ) {
		const sidebarSettings = this.locateSidebarSettings();
		const queryTypeLocator = sidebarSettings.locator(
			SELECTORS.usePageContextControl
		);
		if ( inheritQueryFromTemplate ) {
			await queryTypeLocator.getByLabel( 'Default' ).click();
		} else {
			await queryTypeLocator.getByLabel( 'Custom' ).click();
		}
	}

	async setViewportSize( {
		width,
		height,
	}: {
		width: number;
		height: number;
	} ) {
		await this.page.setViewportSize( { width, height } );
	}

	async insertBlockInProductCollection( block: {
		name: string;
		attributes: object;
	} ) {
		const productTemplate = await this.editor.getBlockByName(
			'poocommerce/product-template'
		);
		const productTemplateId =
			( await productTemplate.getAttribute( 'data-block' ) ) ?? '';

		await this.editor.selectBlocks( productTemplate );
		await this.editor.insertBlock( block, { clientId: productTemplateId } );
	}

	async insertProductCollectionInSingleProductBlock() {
		await this.insertSingleProductBlock();

		const siblingBlock = await this.editor.getBlockByName(
			'poocommerce/product-price'
		);
		const clientId =
			( await siblingBlock.getAttribute( 'data-block' ) ) ?? '';
		const parentClientId =
			( await this.editor.getBlockRootClientId( clientId ) ) ?? '';

		await this.editor.selectBlocks( siblingBlock );
		await this.editor.insertBlock(
			{ name: this.BLOCK_SLUG },
			{ clientId: parentClientId }
		);
	}

	/**
	 * Locators
	 */
	locateSidebarSettings() {
		return this.page.getByRole( 'region', {
			name: 'Editor settings',
		} );
	}

	locateByTestId( testId: string ) {
		return this.page.getByTestId( testId );
	}

	async getCollectionHeading() {
		return this.page.getByRole( 'heading' );
	}

	async getProductNames() {
		const products = this.page.locator( '.wp-block-post-title' );
		return await products.allTextContents();
	}

	/**
	 * Private methods to be used by the class.
	 */
	private async insertSingleProductBlock() {
		await this.editor.insertBlock( { name: 'poocommerce/single-product' } );
		const singleProductBlock = await this.editor.getBlockByName(
			'poocommerce/single-product'
		);
		await singleProductBlock
			.locator( 'input[type="radio"]' )
			.nth( 0 )
			.click();
		await singleProductBlock.getByText( 'Done' ).click();
	}

	async refreshLocators( currentUI: 'editor' | 'frontend' ) {
		if ( currentUI === 'editor' ) {
			await this.initializeLocatorsForEditor();
		} else {
			await this.initializeLocatorsForFrontend();
		}
	}

	private async initializeLocatorsForEditor() {
		this.productTemplate = this.editor.canvas.locator(
			SELECTORS.productTemplate
		);
		this.products = this.editor.canvas
			.locator( SELECTORS.product )
			.locator( 'visible=true' );
		this.productImages = this.editor.canvas
			.locator( SELECTORS.productImage.inEditor )
			.locator( 'visible=true' );
		this.productTitles = this.productTemplate
			.locator( SELECTORS.productTitle )
			.locator( 'visible=true' );
		this.productPrices = this.productTemplate
			.locator( SELECTORS.productPrice.inEditor )
			.locator( 'visible=true' );
		this.addToCartButtons = this.editor.canvas
			.locator( SELECTORS.addToCartButton.inEditor )
			.locator( 'visible=true' );
		this.pagination = this.editor.canvas.getByRole( 'document', {
			name: 'Block: Pagination',
		} );
	}

	private async initializeLocatorsForFrontend() {
		this.productTemplate = this.page.locator( SELECTORS.productTemplate );
		this.products = this.page.locator( SELECTORS.product );
		this.productImages = this.productTemplate.locator(
			SELECTORS.productImage.onFrontend
		);
		this.productTitles = this.productTemplate.locator(
			SELECTORS.productTitle
		);
		this.productPrices = this.productTemplate.locator(
			SELECTORS.productPrice.onFrontend
		);
		this.addToCartButtons = this.productTemplate.locator(
			SELECTORS.addToCartButton.onFrontend
		);
		this.pagination = this.page.locator( SELECTORS.pagination.onFrontend );
	}
}

export default ProductCollectionPage;
