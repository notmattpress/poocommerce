/**
 * External dependencies
 */
import {
	ProductProductAttribute,
	ProductAttributeTerm,
} from '@poocommerce/data';

export type VariationsFilterProps = {
	initialValues: ProductAttributeTerm[ 'slug' ][];
	attribute: ProductProductAttribute;
	onFilter( values: ProductAttributeTerm[ 'slug' ][] ): void;
};
