/**
 * External dependencies
 */
import { Page } from '@playwright/test';
import { Admin } from '@poocommerce/e2e-utils';

export class ShippingUtils {
	private page: Page;
	private admin: Admin;

	constructor( page: Page, admin: Admin ) {
		this.page = page;
		this.admin = admin;
	}

	async openShippingSettings() {
		await this.admin.visitAdminPage(
			'admin.php',
			'page=wc-settings&tab=shipping&section=options'
		);
	}

	async saveShippingSettings() {
		await this.page.getByRole( 'button', { name: 'Save changes' } ).click();
	}

	async enableShippingCostsRequireAddress() {
		await this.openShippingSettings();

		const hide = this.page.getByLabel(
			'Hide shipping costs until an address is entered'
		);

		if ( ! ( await hide.isChecked() ) ) {
			await hide.check();

			await this.saveShippingSettings();
		}
	}

	async disableShippingCostsRequireAddress() {
		await this.openShippingSettings();

		const hide = this.page.getByLabel(
			'Hide shipping costs until an address is entered'
		);

		if ( await hide.isChecked() ) {
			await hide.uncheck();

			await this.saveShippingSettings();
		}
	}
}
