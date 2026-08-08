/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/ui';
import type { Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import type { ProductEntityRecord } from '../types';

export const fieldExtensions: Partial< Field< ProductEntityRecord > > = {
	type: 'text',
	label: __( 'Allow backorders', 'poocommerce' ),
	enableSorting: false,
	filterBy: false,
	isVisible: ( item ) => !! item.manage_stock,
	getValue: ( { item } ) => item.backorders ?? 'no',
	Edit: ( { data, onChange, field } ) => {
		const options = [
			{ value: 'no', label: __( 'Do not allow', 'poocommerce' ) },
			{
				value: 'notify',
				label: __( 'Allow but notify customer', 'poocommerce' ),
			},
			{ value: 'yes', label: __( 'Allow', 'poocommerce' ) },
		];
		const selected = options.find(
			( o ) => o.value === ( data.backorders ?? 'no' )
		);
		return (
			<SelectControl
				label={ field.label }
				value={ selected }
				items={ options }
				onValueChange={ ( option ) => {
					if ( option ) {
						onChange( {
							backorders: option.value as 'no' | 'notify' | 'yes',
						} );
					}
				} }
			/>
		);
	},
};
