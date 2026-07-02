/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Badge, SelectControl } from '@wordpress/ui';
import type { Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import type { ProductEntityRecord } from '../types';

type StockStatus = 'instock' | 'outofstock' | 'onbackorder';

function isValidStockStatus( value: string ): value is StockStatus {
	return (
		value === 'instock' || value === 'outofstock' || value === 'onbackorder'
	);
}

const stockStatusBadgeIntent: Record<
	StockStatus,
	React.ComponentProps< typeof Badge >[ 'intent' ]
> = {
	instock: 'none',
	outofstock: 'high',
	onbackorder: 'draft',
};

const fieldDefinition = {
	label: __( 'Stock', 'poocommerce' ),
	enableSorting: false,
	enableHiding: false,
	filterBy: {
		operators: [ 'isAny' ],
	},
	elements: [
		{ label: __( 'In stock', 'poocommerce' ), value: 'instock' },
		{ label: __( 'Out of stock', 'poocommerce' ), value: 'outofstock' },
		{ label: __( 'On backorder', 'poocommerce' ), value: 'onbackorder' },
	],
} satisfies Partial< Field< ProductEntityRecord > >;

export const fieldExtensions: Partial< Field< ProductEntityRecord > > = {
	...fieldDefinition,
	isVisible: ( item ) => {
		return ! item.manage_stock;
	},
	getValue: ( { item } ) => item.stock_status,
	render: ( { item, field } ) => {
		const match = field?.elements?.find(
			( status ) => status.value === item.stock_status
		);

		if ( ! match || ! isValidStockStatus( match.value ) ) {
			return item.stock_status;
		}

		const stockLabel =
			item.stock_quantity && item.stock_quantity > 0
				? `${ match.label } (${ item.stock_quantity })`
				: match.label;

		return (
			<div className="poocommerce-fields-field__stock">
				<Badge intent={ stockStatusBadgeIntent[ match.value ] }>
					{ stockLabel }
				</Badge>
			</div>
		);
	},
	Edit: ( { data, onChange, field } ) => {
		const options = field?.elements ?? [];
		const selectedOption =
			field.placeholder && ! data.stock_status
				? undefined
				: options.find(
						( option ) => option.value === data.stock_status
				  );

		return (
			<SelectControl
				label={ __( 'Stock status', 'poocommerce' ) }
				placeholder={ field.placeholder }
				value={ selectedOption }
				items={ options }
				onValueChange={ ( option ) => {
					const value = option?.value;

					if (
						typeof value === 'string' &&
						isValidStockStatus( value )
					) {
						onChange( {
							stock_status: value,
						} );
					}
				} }
			/>
		);
	},
};
