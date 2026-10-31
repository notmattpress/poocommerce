/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { ProductOrderbyControlProps } from './types';

/**
 * A pre-configured SelectControl for product orderby settings.
 *
 * @param {Object}            props               Incoming props for the component.
 * @param {string}            props.value
 * @param {function(any):any} props.setAttributes Setter for block attributes.
 */
const ProductOrderbyControl = ( {
	value,
	setAttributes,
}: ProductOrderbyControlProps ) => {
	return (
		<SelectControl
			label={ __( 'Order products by', 'poocommerce' ) }
			value={ value }
			options={ [
				{
					label: __( 'Newness - newest first', 'poocommerce' ),
					value: 'date',
				},
				{
					label: __( 'Price - low to high', 'poocommerce' ),
					value: 'price_asc',
				},
				{
					label: __( 'Price - high to low', 'poocommerce' ),
					value: 'price_desc',
				},
				{
					label: __( 'Rating - highest first', 'poocommerce' ),
					value: 'rating',
				},
				{
					label: __( 'Sales - most first', 'poocommerce' ),
					value: 'popularity',
				},
				{
					label: __( 'Title - alphabetical', 'poocommerce' ),
					value: 'title',
				},
				{
					label: __( 'Menu Order', 'poocommerce' ),
					value: 'menu_order',
				},
			] }
			onChange={ ( orderby ) => setAttributes( { orderby } ) }
		/>
	);
};

export default ProductOrderbyControl;
