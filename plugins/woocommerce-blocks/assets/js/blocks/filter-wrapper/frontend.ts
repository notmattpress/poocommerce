/**
 * External dependencies
 */
import { renderParentBlock } from '@poocommerce/atomic-utils';
import { getRegisteredBlockComponents } from '@poocommerce/blocks-registry';

/**
 * Internal dependencies
 */
import Block from './block';

renderParentBlock( {
	blockName: 'poocommerce/filter-wrapper',
	selector: '.wp-block-poocommerce-filter-wrapper',
	Block,
	blockMap: getRegisteredBlockComponents( 'poocommerce/filter-wrapper' ),
} );
