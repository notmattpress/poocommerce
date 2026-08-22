/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { SortSelect } from '@poocommerce/blocks-components';

/**
 * Internal dependencies
 */
import './style.scss';
import { ProductSortSelectProps } from '../types';

const ProductSortSelect = ( {
	onChange,
	value,
}: ProductSortSelectProps ): JSX.Element => {
	return (
		<SortSelect
			className="wc-block-product-sort-select wc-block-components-product-sort-select"
			onChange={ onChange }
			options={ [
				{
					key: 'menu_order',
					label: __( 'Default sorting', 'poocommerce' ),
				},
				{
					key: 'popularity',
					label: __( 'Popularity', 'poocommerce' ),
				},
				{
					key: 'rating',
					label: __( 'Average rating', 'poocommerce' ),
				},
				{
					key: 'date',
					label: __( 'Latest', 'poocommerce' ),
				},
				{
					key: 'price',
					label: __( 'Price: low to high', 'poocommerce' ),
				},
				{
					key: 'price-desc',
					label: __( 'Price: high to low', 'poocommerce' ),
				},
			] }
			screenReaderLabel={ __( 'Order products by', 'poocommerce' ) }
			value={ value }
		/>
	);
};

export default ProductSortSelect;
