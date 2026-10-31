/**
 * External dependencies
 */
import type { Block } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import registerProductTitleVariation from './product-title';
import registerProductSummaryVariation from './product-summary';

addFilter(
	'blocks.registerBlockType',
	'poocommerce/product-elements/namespace',
	( settings: Block, blockName: string ) => {
		if (
			! [ 'core/post-title', 'core/post-excerpt' ].includes( blockName )
		) {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				__poocommerceNamespace: { type: 'string' },
			},
		};
	}
);

registerProductTitleVariation();
registerProductSummaryVariation();
