/**
 * External dependencies
 */
import { Page, Locator } from '@playwright/test';
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

export class FrontendUtils {
	page: Page;
	requestUtils: RequestUtils;

	constructor( page: Page, requestUtils: RequestUtils ) {
		this.page = page;
		this.requestUtils = requestUtils;
	}

	async getBlockByName( name: string, parentSelector?: string ) {
		let selector = `[data-block-name="${ name }"]`;
		if ( parentSelector ) {
			selector = `${ parentSelector } [data-block-name="${ name }"]`;
		}
		return this.page.locator( selector );
	}

	async addToCart( itemName = '' ) {
		const cartResponsePromise = this.page.waitForResponse( ( response ) => {
			const url = response.url();
			return (
				url.includes( 'cart' ) ||
				url.includes( 'add_to_cart' ) ||
				url.includes( 'batch' )
			);
		} );

		if ( itemName !== '' ) {
			// We can't use `getByRole()` here because the Add to Cart button
			// might be a button (in blocks) or a link (in the legacy template).
			await this.page
				.getByLabel( `Add to cart: “${ itemName }”` )
				.click();
		} else {
			await this.page.click( 'text=Add to cart' );
		}

		await cartResponsePromise;

		/**
		 * There's a race condition where the cart is not fully updated
		 * immediately when adding multiple items one by one, even though the
		 * response is received. This timeout ensures the cart is updated before
		 * the next test step.
		 */
		// eslint-disable-next-line playwright/no-wait-for-timeout, no-restricted-syntax
		await this.page.waitForTimeout( 2000 );
	}

	async goToCheckout() {
		await this.page.goto( '/checkout' );
	}

	async goToCart() {
		await this.page.goto( '/cart' );
	}

	async goToCartShortcode() {
		await this.page.goto( '/cart-shortcode' );
	}

	async goToMiniCart() {
		await this.page.goto( '/mini-cart' );
	}

	async goToShop() {
		await this.page.goto( '/shop' );
	}

	async emptyCart() {
		const cartResponse = await this.requestUtils.request.get(
			'/wp-json/wc/store/cart'
		);
		const nonce = cartResponse.headers()?.nonce;
		if ( ! nonce ) {
			throw new Error( 'Could not get cart nonce.' );
		}
		const res = await this.requestUtils.request.delete(
			'/wp-json/wc/store/v1/cart/items',
			{ headers: { nonce } }
		);
		if ( ! res.ok() ) {
			throw new Error(
				`Got an error response when trying to empty cart. Status code: ${ res.status() }`
			);
		}
	}

	/**
	 * Playwright selectText causes flaky tests when running on local
	 * development machine. This method is more reliable on both environments.
	 */
	async selectTextInput( locator: Locator ) {
		await locator.click();
		await locator.press( 'End' );
		await locator.press( 'Shift+Home' );
	}

	async gotoMyAccount() {
		await this.page.goto( '/my-account' );
	}
}
