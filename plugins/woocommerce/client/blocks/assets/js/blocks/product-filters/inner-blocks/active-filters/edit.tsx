/**
 * External dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockContextProvider,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { InitialDisabled } from '../../components/initial-disabled';
import { EXCLUDED_BLOCKS } from '../../constants';
import { getAllowedBlocks } from '../../utils/get-allowed-blocks';
import { filtersPreview } from './constants';
import type { RemovableItemsContext } from '../../../../types/type-defs/removable-items';

const Edit = () => {
	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		useBlockProps(),
		{
			allowedBlocks: getAllowedBlocks( EXCLUDED_BLOCKS ),
			template: [
				[ 'poocommerce/product-filter-removable-chips' ],
				[ 'poocommerce/product-filter-clear-button' ],
			],
		}
	);

	return (
		<div { ...innerBlocksProps }>
			<InitialDisabled>
				<BlockContextProvider
					value={ {
						'poocommerce/removableItems': {
							items: filtersPreview,
							storeNamespace: 'poocommerce/product-filters',
						} satisfies RemovableItemsContext,
					} }
				>
					{ children }
				</BlockContextProvider>
			</InitialDisabled>
		</div>
	);
};

export default Edit;
