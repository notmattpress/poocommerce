/**
 * Internal dependencies
 */
import { STORE_NAME, WC_SHIPPING_ZONES_NAMESPACE } from './constants';
import { createCrudDataStore } from '../crud';
import { ShippingZonesActions, ShippingZonesSelectors } from './types';

export const store = createCrudDataStore<
	ShippingZonesActions,
	ShippingZonesSelectors
>( {
	storeName: STORE_NAME,
	resourceName: 'ShippingZone',
	pluralResourceName: 'ShippingZones',
	namespace: WC_SHIPPING_ZONES_NAMESPACE,
} );

export const EXPERIMENTAL_SHIPPING_ZONES_STORE_NAME = STORE_NAME;
