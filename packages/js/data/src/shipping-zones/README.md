# Shipping Zones Data Store

This data store provides functions to interact with the [Shipping Zones REST endpoints](https://poocommerce.github.io/poocommerce-rest-api-docs/#shipping-zones).
Under the hood this data store makes use of the [CRUD data store](../crud/README.md).

**Note: This data store is listed as experimental still as it is still in active development.**

## Usage

This data store can be accessed under the `experimental/wc/admin/shipping/zones` name. It is recommended you make use of the export store `experimentalShippingZonesStore`.

Example:

```ts
import {
	experimentalShippingZonesStore,
} from '@poocommerce/data';
import { useDispatch } from '@wordpress/data';

function Component() {
	const actions = useDispatch(
		experimentalShippingZonesStore
	);
	actions.createShippingZone( { name: 'test' } );
}
```

## Selections and actions

| Selector                               | Description                                             |
| -------------------------------------- | ------------------------------------------------------- |
| `getShippingZone( id: number )`        | Gets a Shipping Zone by ID                              |
| `getShippingZoneError( id )`           | Get the error for a failing GET shipping zone request.  |
| `getShippingZones( query = {} )`       | Get all shipping zones, query object is empty.          |
| `getShippingZoneesError( query = {} )` | Get the error for a GET request for all shipping zones. |

Example usage: `wp.data.select( experimentalShippingZonesStore ).getShippingZone( 3 );`

| Actions                                         | Method | Description                                                               |
| ----------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| `createShippingZone( shippingZoneObject )`      | POST   | Creates shipping zone, see `ShippingZone` [here](./types.ts) for values   |
| `deleteShippingZone( id )`                      | DELETE | Deletes a shipping class by ID                                            |
| `updatetShippingZone( id, shippingZoneObject )` | PUT    | Updates a shipping zone, see `ShippingZone` [here](./types.ts) for values |

Example usage: `wp.data.dispatch( experimentalShippingZonesStore ).updateShippingZone( 3, { name: 'New name' } );`
