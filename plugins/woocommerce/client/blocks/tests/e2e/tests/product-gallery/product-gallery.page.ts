/**
 * External dependencies
 */
import { Page } from '@playwright/test';
import { Editor, FrontendUtils } from '@poocommerce/e2e-utils';

const selectors = {
	editor: {
		zoomWhileHoveringSetting:
			"xpath=//label[contains(text(), 'Zoom while hovering')]/preceding-sibling::span/input",
		fullScreenOnClickSetting:
			"xpath=//label[contains(text(), 'Open pop-up when clicked')]/preceding-sibling::span/input",
	},
};

export class ProductGalleryPage {
	editor: Editor;
	page: Page;
	frontendUtils: FrontendUtils;
	constructor( {
		editor,
		page,
		frontendUtils,
	}: {
		editor: Editor;
		page: Page;
		frontendUtils: FrontendUtils;
	} ) {
		this.editor = editor;
		this.page = page;
		this.frontendUtils = frontendUtils;
		this.editor = editor;
	}

	async addProductGalleryBlock( { cleanContent = true } ) {
		if ( cleanContent ) {
			await this.editor.setContent( '' );
		}
		await this.editor.insertBlock( {
			name: 'poocommerce/product-gallery',
		} );
	}

	async addAddToCartWithOptionsBlock() {
		await this.editor.insertBlock( {
			name: 'poocommerce/add-to-cart-form',
		} );
	}

	getZoomWhileHoveringSetting() {
		return this.page.locator( selectors.editor.zoomWhileHoveringSetting );
	}

	getFullScreenOnClickSetting() {
		return this.page.locator( selectors.editor.fullScreenOnClickSetting );
	}

	async toggleFullScreenOnClickSetting( enable: boolean ) {
		const button = this.page.locator(
			selectors.editor.fullScreenOnClickSetting
		);
		const isChecked = await button.isChecked();

		// Toggle the checkbox if it's not in the desired state.
		if ( enable && ! isChecked ) {
			await button.click();
		} else if ( ! enable && isChecked ) {
			await button.click();
		}
	}

	/**
	 * Get the image ID of the active image element.
	 *
	 * @param {Object} params      - The parameters object.
	 * @param {Page}   params.page - The page.
	 * @return The image element id.
	 */
	async getActiveImageElementId( { page }: { page: Page } ) {
		return page.evaluate( () => {
			const element = document?.activeElement;
			if ( ! element ) {
				return null;
			}

			const dataImageId = element.getAttribute( 'data-image-id' );
			if ( dataImageId ) {
				return dataImageId;
			}

			return null;
		} );
	}

	async toggleZoomWhileHoveringSetting( enable: boolean ) {
		const button = this.page.locator(
			selectors.editor.zoomWhileHoveringSetting
		);
		const isChecked = await button.isChecked();

		// Toggle the checkbox if it's not in the desired state.
		if ( enable && ! isChecked ) {
			await button.click();
		} else if ( ! enable && isChecked ) {
			await button.click();
		}
	}

	async getMainImageBlock( { page }: { page: 'frontend' | 'editor' } ) {
		const blockName = 'poocommerce/product-gallery-large-image';
		if ( page === 'frontend' ) {
			return (
				await this.frontendUtils.getBlockByName( blockName )
			 ).filter( {
				has: this.page.locator( ':visible' ),
			} );
		}
		return this.editor.getBlockByName( blockName );
	}

	async getThumbnailsBlock( { page }: { page: 'frontend' | 'editor' } ) {
		const blockName = 'poocommerce/product-gallery-thumbnails';
		if ( page === 'frontend' ) {
			return (
				await this.frontendUtils.getBlockByName( blockName )
			 ).filter( {
				has: this.page.locator( ':visible' ),
			} );
		}
		return this.editor.getBlockByName( blockName );
	}

	async getNextPreviousButtonsBlock( {
		page,
	}: {
		page: 'frontend' | 'editor';
	} ) {
		const blockName =
			'poocommerce/product-gallery-large-image-next-previous';
		if ( page === 'frontend' ) {
			return (
				await this.frontendUtils.getBlockByName( blockName )
			 ).filter( {
				has: this.page.locator( ':visible' ),
			} );
		}
		return this.editor.getBlockByName( blockName );
	}

	async getBlock( { page }: { page: 'frontend' | 'editor' } ) {
		const blockName = 'poocommerce/product-gallery';
		if ( page === 'frontend' ) {
			return (
				await this.frontendUtils.getBlockByName( blockName )
			 ).filter( {
				has: this.page.locator( ':visible' ),
			} );
		}
		return this.editor.getBlockByName( blockName );
	}

	async getAddToCartWithOptionsBlock( {
		page,
	}: {
		page: 'frontend' | 'editor';
	} ) {
		const blockName = 'poocommerce/add-to-cart-form';
		if ( page === 'frontend' ) {
			return (
				await this.frontendUtils.getBlockByName( blockName )
			 ).filter( {
				has: this.page.locator( ':visible' ),
			} );
		}
		return this.editor.getBlockByName( blockName );
	}
}
