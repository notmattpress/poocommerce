const { test } = require( './fixtures' );
const { ADMIN_STATE_PATH } = require( '../playwright.config' );

exports.test = test.extend( {
	page: async ( { page, api, wcAdminApi }, use ) => {
		// Enable product block editor
		await api.put(
			'settings/advanced/poocommerce_feature_product_block_editor_enabled',
			{
				value: 'yes',
			}
		);

		// Disable the product editor tour
		await wcAdminApi.post( 'options', {
			poocommerce_block_product_tour_shown: 'yes',
		} );

		await use( page );

		// Disable product block editor
		await api.put(
			'settings/advanced/poocommerce_feature_product_block_editor_enabled',
			{
				value: 'no',
			}
		);
	},
	storageState: ADMIN_STATE_PATH,
} );
