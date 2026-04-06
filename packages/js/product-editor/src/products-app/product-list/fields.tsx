/**
 * External dependencies
 */
import { createElement, Fragment } from '@wordpress/element';
import { Product } from '@poocommerce/data';
import { __ } from '@wordpress/i18n';
import { Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import { OPERATOR_IS } from '../constants';

const STATUSES = [
	{ value: 'draft', label: __( 'Draft', 'poocommerce' ) },
	{ value: 'future', label: __( 'Scheduled', 'poocommerce' ) },
	{ value: 'private', label: __( 'Private', 'poocommerce' ) },
	{ value: 'publish', label: __( 'Published', 'poocommerce' ) },
	{ value: 'trash', label: __( 'Trash', 'poocommerce' ) },
];

/**
 * TODO: auto convert some of the product editor blocks ( from the blocks directory ) to this format.
 * The edit function should work relatively well with the edit from the blocks, the only difference is that the blocks rely on getEntityProp to get the value
 */
export const productFields: Field< Product >[] = [
	{
		id: 'name',
		label: __( 'Name', 'poocommerce' ),
		enableHiding: false,
		type: 'text',
		render: function nameRender( { item }: { item: Product } ) {
			return <>{ item.name }</>;
		},
	},
	{
		id: 'sku',
		label: __( 'SKU', 'poocommerce' ),
		enableHiding: false,
		enableSorting: false,
		render: ( { item }: { item: Product } ) => {
			return <>{ item.sku }</>;
		},
	},
	{
		id: 'date',
		label: __( 'Date', 'poocommerce' ),
		render: ( { item }: { item: Product } ) => {
			return <time>{ item.date_created }</time>;
		},
	},
	{
		label: __( 'Status', 'poocommerce' ),
		id: 'status',
		getValue: ( { item }: { item: Product } ) =>
			STATUSES.find( ( { value } ) => value === item.status )?.label ??
			item.status,
		elements: STATUSES,
		filterBy: {
			operators: [ OPERATOR_IS ],
		},
		enableSorting: false,
	},
];
