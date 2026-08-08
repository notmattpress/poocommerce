/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

import type { Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import type { ProductEntityRecord } from '../types';

const fieldDefinition = {
	enableSorting: false,
	enableHiding: false,
	filterBy: false,
	elements: [
		{ label: __( 'In stock', 'poocommerce' ), value: 'instock' },
		{ label: __( 'Out of stock', 'poocommerce' ), value: 'outofstock' },
		{ label: __( 'On backorder', 'poocommerce' ), value: 'onbackorder' },
	],
} satisfies Partial< Field< ProductEntityRecord > >;

export const fieldExtensions: Partial< Field< ProductEntityRecord > > = {
	...fieldDefinition,
	render: ( { item, field } ) => {
		const status = item.stock_status?.toLowerCase?.() ?? 'instock';
		const match = field.elements?.find(
			( element: { value: string } ) => element.value === status
		);

		if ( item.manage_stock ) {
			if (
				! Number.isFinite( item.stock_quantity ) ||
				item.stock_quantity === null ||
				item.stock_quantity === undefined
			) {
				return (
					<div className="poocommerce-fields-field__inventory-summary">
						{ __( 'No stock quantity set', 'poocommerce' ) }
					</div>
				);
			}

			return (
				<div className="poocommerce-fields-field__inventory-summary">
					{ sprintf(
						/* translators: %d: stock quantity */
						__( '%d available in stock', 'poocommerce' ),
						item.stock_quantity
					) }
				</div>
			);
		}
		return (
			<div className="poocommerce-fields-field__inventory-summary">
				{ match?.label ?? item.stock_status }
			</div>
		);
	},
};
