/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

const unsupportedBlocks = [
	'core/post-content',
	'poocommerce/mini-cart',
	'poocommerce/product-search',
	'poocommerce/product-title',
	// Classic wrapper blocks
	'poocommerce/classic-shortcode',
	'poocommerce/legacy-template',
	// Legacy filter blocks
	'poocommerce/active-filters',
	'poocommerce/price-filter',
	'poocommerce/stock-filter',
	'poocommerce/attribute-filter',
	'poocommerce/rating-filter',
	// Deprecated product grid blocks
	'poocommerce/handpicked-products',
	'poocommerce/product-best-sellers',
	'poocommerce/product-category',
	'poocommerce/product-new',
	'poocommerce/product-on-sale',
	'poocommerce/product-tag',
	'poocommerce/product-top-rated',
];

const supportedPrefixes = [ 'core/', 'poocommerce/' ];

const isBlockSupported = ( blockName: string ) => {
	// Check for explicitly unsupported blocks
	if ( unsupportedBlocks.includes( blockName ) ) {
		return false;
	}

	// Check for supported prefixes
	if (
		supportedPrefixes.find( ( prefix ) => blockName.startsWith( prefix ) )
	) {
		return true;
	}

	// Otherwise block is unsupported
	return false;
};

export const useHasUnsupportedBlocks = ( clientId: string ): boolean =>
	useSelect(
		( select ) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore No types for this exist yet
			const { getClientIdsOfDescendants, getBlockName } =
				select( blockEditorStore );

			const hasUnsupportedBlocks =
				getClientIdsOfDescendants( clientId ).find(
					( blockId: string ) => {
						const blockName = getBlockName( blockId );
						const supported = isBlockSupported( blockName );
						return ! supported;
					}
				) || false;

			return hasUnsupportedBlocks;
		},
		[ clientId ]
	);
