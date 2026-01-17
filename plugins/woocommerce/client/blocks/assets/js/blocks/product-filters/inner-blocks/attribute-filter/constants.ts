/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export const attributeOptionsPreview = [
	{
		label: __( 'Blue', 'poocommerce' ),
		value: 'blue',
		rawData: {
			id: 23,
			name: __( 'Blue', 'poocommerce' ),
			slug: 'blue',
			attr_slug: 'blue',
			description: '',
			parent: 0,
			count: 4,
		},
	},
	{
		label: __( 'Gray', 'poocommerce' ),
		value: 'gray',
		selected: true,
		rawData: {
			id: 29,
			name: __( 'Gray', 'poocommerce' ),
			slug: 'gray',
			attr_slug: 'gray',
			description: '',
			parent: 0,
			count: 3,
		},
	},
	{
		label: __( 'Green', 'poocommerce' ),
		value: 'green',
		rawData: {
			id: 24,
			name: __( 'Green', 'poocommerce' ),
			slug: 'green',
			attr_slug: 'green',
			description: '',
			parent: 0,
			count: 3,
		},
	},
	{
		label: __( 'Red', 'poocommerce' ),
		value: 'red',
		selected: true,
		rawData: {
			id: 25,
			name: __( 'Red', 'poocommerce' ),
			slug: 'red',
			attr_slug: 'red',
			description: '',
			parent: 0,
			count: 4,
		},
	},
	{
		label: __( 'Yellow', 'poocommerce' ),
		value: 'yellow',
		rawData: {
			id: 30,
			name: __( 'Yellow', 'poocommerce' ),
			slug: 'yellow',
			attr_slug: 'yellow',
			description: '',
			parent: 0,
			count: 1,
		},
	},
];

export const sortOrders = {
	'name-asc': __( 'Name, A to Z', 'poocommerce' ),
	'name-desc': __( 'Name, Z to A', 'poocommerce' ),
	'count-desc': __( 'Most results first', 'poocommerce' ),
	'count-asc': __( 'Least results first', 'poocommerce' ),
};

export const sortOrderOptions = Object.entries( sortOrders ).map(
	( [ value, label ] ) => ( {
		label,
		value,
	} )
);
