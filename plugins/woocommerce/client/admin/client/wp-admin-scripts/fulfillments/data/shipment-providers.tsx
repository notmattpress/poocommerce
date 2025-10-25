/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

const ShipmentProviders: ShipmentProvider[] = [
	...Object.values( window.wcFulfillmentSettings.providers ?? {} ),
	{
		label: __( 'Other', 'poocommerce' ),
		icon: null,
		value: 'other',
		url: '',
	},
];
export default ShipmentProviders;
