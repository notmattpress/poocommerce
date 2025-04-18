/**
 * External dependencies
 */
import { Page } from '@playwright/test';
import { Admin } from '@poocommerce/e2e-utils';

export const blockData = {
	name: 'Product Button',
	slug: 'poocommerce/product-button',
	mainClass: '.wc-block-product-button',
	selectors: {
		frontend: {
			productsToDisplay: 16,
		},
		editor: {},
	},
};

export const handleAddToCartAjaxSetting = async (
	admin: Admin,
	page: Page,
	{
		isChecked,
	}: {
		isChecked: boolean;
	}
) => {
	await admin.page.goto( 'wp-admin/admin.php?page=wc-settings&tab=products' );
	await page
		.getByRole( 'checkbox', {
			name: 'Enable AJAX add to cart buttons on archives',
			checked: isChecked,
		} )
		.click();

	await page
		.getByRole( 'button', {
			name: 'save',
		} )
		.click();
};
