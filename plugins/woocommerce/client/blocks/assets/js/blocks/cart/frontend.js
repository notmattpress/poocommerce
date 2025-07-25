/**
 * External dependencies
 */
import { getValidBlockAttributes } from '@poocommerce/base-utils';
import { Children, cloneElement, isValidElement } from '@wordpress/element';
import { useStoreCart } from '@poocommerce/base-context';
import { getRegisteredBlockComponents } from '@poocommerce/blocks-registry';

import { renderParentBlock } from '@poocommerce/atomic-utils';

/**
 * Internal dependencies
 */
import './inner-blocks/register-components';
import Block from './block';
import { blockName, blockAttributes } from './attributes';
import { metadata } from './metadata';

const getProps = ( el ) => {
	return {
		attributes: getValidBlockAttributes(
			blockAttributes,
			!! el ? el.dataset : {}
		),
	};
};

const Wrapper = ( { children } ) => {
	// we need to pluck out receiveCart.
	// eslint-disable-next-line no-unused-vars
	const { extensions, receiveCart, ...cart } = useStoreCart();
	return Children.map( children, ( child ) => {
		if ( isValidElement( child ) ) {
			const componentProps = {
				extensions,
				cart,
			};
			return cloneElement( child, componentProps );
		}
		return child;
	} );
};

renderParentBlock( {
	Block,
	blockName,
	selector: '.wp-block-poocommerce-cart',
	getProps,
	blockMap: getRegisteredBlockComponents( blockName ),
	blockWrapper: Wrapper,
	options: {
		multiple: metadata.supports?.multiple ?? false,
	},
} );
