/**
 * External dependencies
 */
import { Children, cloneElement, isValidElement } from '@wordpress/element';
import { getValidBlockAttributes } from '@poocommerce/base-utils';
import { useStoreCart } from '@poocommerce/base-context';
import {
	useCheckoutExtensionData,
	useValidation,
} from '@poocommerce/base-context/hooks';
import { getRegisteredBlockComponents } from '@poocommerce/blocks-registry';
import { renderParentBlock } from '@poocommerce/atomic-utils';

/**
 * Internal dependencies
 */
import './inner-blocks/register-components';
import Block from './block';
import { blockName, blockAttributes } from './attributes';
import metadata from './block.json';

const getProps = ( el: Element ) => {
	return {
		attributes: getValidBlockAttributes(
			{ ...metadata.attributes, ...blockAttributes },
			/* eslint-disable @typescript-eslint/no-explicit-any */
			( el instanceof HTMLElement ? el.dataset : {} ) as any
		),
	};
};

const Wrapper = ( {
	children,
}: {
	children: React.ReactChildren;
} ): React.ReactNode => {
	// we need to pluck out receiveCart.
	// eslint-disable-next-line no-unused-vars
	const { extensions, receiveCart, ...cart } = useStoreCart();
	const checkoutExtensionData = useCheckoutExtensionData();
	const validation = useValidation();
	return Children.map( children, ( child ) => {
		if ( isValidElement( child ) ) {
			const componentProps = {
				extensions,
				cart,
				checkoutExtensionData,
				validation,
			};
			return cloneElement( child, componentProps );
		}
		return child;
	} );
};

renderParentBlock( {
	Block,
	blockName,
	selector:
		'.wp-block-poocommerce-checkout[data-block-name="poocommerce/checkout"]',
	getProps,
	blockMap: getRegisteredBlockComponents( blockName ),
	blockWrapper: Wrapper,
	options: {
		multiple: metadata.supports.multiple,
	},
} );
