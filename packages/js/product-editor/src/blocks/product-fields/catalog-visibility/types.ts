/**
 * External dependencies
 */
import { Product } from '@poocommerce/data';
import { BlockAttributes } from '@wordpress/blocks';

export interface CatalogVisibilityBlockAttributes extends BlockAttributes {
	label: string;
	visibility: Product[ 'catalog_visibility' ];
}
