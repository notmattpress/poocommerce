/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { BlockFill } from '../block-fill';
import { BlockFillProps } from '../types';

export type SectionActionsProps = Omit<
	BlockFillProps,
	'name' | 'slotContainerBlockName'
> & {
	containerBlockName?: string | string[];
};

const DEFAULT_SECTION_BLOCKS = [
	'poocommerce/product-section',
	'poocommerce/product-subsection',
];

export function SectionActions( {
	containerBlockName = DEFAULT_SECTION_BLOCKS,
	...restProps
}: SectionActionsProps ) {
	return (
		<BlockFill
			{ ...restProps }
			name="section-actions"
			slotContainerBlockName={ containerBlockName }
		/>
	);
}
