/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { ToggleControl, SelectControl } from '@wordpress/components';

export const getSharedContentControls = ( attributes, setAttributes ) => {
	const { contentVisibility } = attributes;
	return (
		<ToggleControl
			label={ __( 'Show Sorting Dropdown', 'poocommerce' ) }
			checked={ contentVisibility.orderBy }
			onChange={ () =>
				setAttributes( {
					contentVisibility: {
						...contentVisibility,
						orderBy: ! contentVisibility.orderBy,
					},
				} )
			}
		/>
	);
};

export const getSharedListControls = ( attributes, setAttributes ) => {
	return (
		<SelectControl
			label={ __( 'Order Products By', 'poocommerce' ) }
			value={ attributes.orderby }
			options={ [
				{
					label: __( 'Default sorting (menu order)', 'poocommerce' ),
					value: 'menu_order',
				},
				{
					label: __( 'Popularity', 'poocommerce' ),
					value: 'popularity',
				},
				{
					label: __( 'Average rating', 'poocommerce' ),
					value: 'rating',
				},
				{
					label: __( 'Latest', 'poocommerce' ),
					value: 'date',
				},
				{
					label: __( 'Price: low to high', 'poocommerce' ),
					value: 'price',
				},
				{
					label: __( 'Price: high to low', 'poocommerce' ),
					value: 'price-desc',
				},
			] }
			onChange={ ( orderby ) => setAttributes( { orderby } ) }
		/>
	);
};
