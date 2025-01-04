/**
 * External dependencies
 */
import React from 'react';
import { Slot, Fill } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import {
	createOrderedChildren,
	sortFillsByOrder,
} from '@poocommerce/components';

export const WC_FOOTER_SLOT_NAME = 'poocommerce_footer_item';

/**
 * Create a Fill for extensions to add items to the PooCommerce Admin footer.
 *
 * @slotFill WooFooterItem
 * @scope poocommerce-admin
 * @example
 * const MyFooterItem = () => (
 * <WooFooterItem>My header item</WooFooterItem>
 * );
 *
 * registerPlugin( 'my-extension', {
 * render: MyFooterItem,
 * scope: 'poocommerce-admin',
 * } );
 * @param {Object} param0
 * @param {Array}  param0.children - Node children.
 * @param {Array}  param0.order    - Node order.
 */
export const WooFooterItem: React.FC< {
	children?: React.ReactNode;
	order?: number;
} > & {
	Slot: React.FC< React.ComponentProps< typeof Slot > >;
} = ( { children, order = 1 } ) => {
	return (
		<Fill name={ WC_FOOTER_SLOT_NAME }>
			{ ( fillProps ) => {
				return createOrderedChildren( children, order, fillProps );
			} }
		</Fill>
	);
};

WooFooterItem.Slot = ( { fillProps } ) => (
	<Slot name={ WC_FOOTER_SLOT_NAME } fillProps={ fillProps }>
		{ sortFillsByOrder }
	</Slot>
);
