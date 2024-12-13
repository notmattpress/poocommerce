/**
 * External dependencies
 */
import { ProductCatalogVisibility } from '@poocommerce/data';

export type CatalogVisibilityProps = {
	catalogVisibility: string;
	label: string;
	visibility: ProductCatalogVisibility;
	onCheckboxChange: ( value: ProductCatalogVisibility ) => void;
};
