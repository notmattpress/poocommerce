/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { isExperimentalWcRestApiV4Enabled } from '@poocommerce/block-settings';

/**
 * Internal dependencies
 */
import { Entity } from '../types';
import { ProductEntityResponse } from './types';

export const PRODUCT_ENTITY: Entity = {
	name: 'product',
	kind: 'root',
	baseURL: isExperimentalWcRestApiV4Enabled()
		? '/wc/v4/products'
		: '/wc/v3/products',
	label: __( 'Product', 'poocommerce' ),
	plural: __( 'Products', 'poocommerce' ),
	key: 'id',
	supportsPagination: true,
	getTitle: ( record ) => {
		const recordData = record as ProductEntityResponse;
		return recordData.name;
	},
};
