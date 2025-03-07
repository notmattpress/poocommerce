/**
 * External dependencies
 */
import { ChangeEvent } from 'react';
import { Product } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Get additional props to be passed to all checkbox inputs.
 *
 * @param name Name of the checkbox.
 * @return Props.
 */
export function getCheckboxTracks< T = Product >( name: string ) {
	return {
		onChange: (
			isChecked: ChangeEvent< HTMLInputElement > | T[ keyof T ]
		) => {
			recordEvent( `product_checkbox_${ name }`, {
				checked: isChecked,
			} );
		},
	};
}
