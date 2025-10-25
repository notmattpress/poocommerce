/**
 * External dependencies
 */
import { ReactNode } from 'react';
import { Slot, Fill } from '@wordpress/components';
import { createElement, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { createOrderedChildren, sortFillsByOrder } from '../../utils';
import { ProductFillLocationType } from '../woo-product-tab-item';

type WooProductSectionItemProps = {
	id: string;
	tabs: ProductFillLocationType[];
	pluginId: string;
	children: ReactNode;
};

type WooProductSectionSlotProps = {
	tab: string;
};

const DEFAULT_SECTION_ORDER = 20;

export const WooProductSectionItem = ( {
	children,
	tabs,
}: WooProductSectionItemProps ) => {
	return (
		<>
			{ tabs.map( ( { name: tabName, order: sectionOrder } ) => (
				<Fill
					name={ `poocommerce_product_section_${ tabName }` }
					key={ tabName }
				>
					{ ( fillProps ) => {
						return createOrderedChildren(
							children,
							sectionOrder || DEFAULT_SECTION_ORDER,
							{
								tabName,
								...fillProps,
							}
						);
					} }
				</Fill>
			) ) }
		</>
	);
};

WooProductSectionItem.Slot = ( {
	fillProps,
	tab,
}: WooProductSectionSlotProps & {
	fillProps: React.ComponentProps< typeof Slot >[ 'fillProps' ];
} ) => (
	<Slot
		name={ `poocommerce_product_section_${ tab }` }
		fillProps={ fillProps }
	>
		{ ( fills ) => {
			if ( ! sortFillsByOrder ) {
				return null;
			}
			// @ts-expect-error The type definitions for Slot are incorrect.
			return sortFillsByOrder( fills );
		} }
	</Slot>
);
