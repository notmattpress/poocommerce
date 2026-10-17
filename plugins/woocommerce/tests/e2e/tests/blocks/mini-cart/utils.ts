/**
 * External dependencies
 */
import { FrontendUtils, BlockData } from '@poocommerce/e2e-utils';

export const blockData: BlockData = {
	name: 'Mini-Cart',
	slug: 'poocommerce/mini-cart',
	mainClass: '.wc-block-minicart',
	selectors: {
		frontend: {},
		editor: {},
	},
};

export const openMiniCart = async ( frontendUtils: FrontendUtils ) => {
	const block = await frontendUtils.getBlockByName( 'poocommerce/mini-cart' );
	await block.click();
};
