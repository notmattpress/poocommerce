/**
 * External dependencies
 */
import { cartStore, processErrorResponse } from '@poocommerce/block-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { isObject } from '@poocommerce/types';
import { useEffect, useRef, useCallback } from '@wordpress/element';
import {
	hasCollectableRate,
	deriveSelectedShippingRates,
} from '@poocommerce/base-utils';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import { useStoreEvents } from '../use-store-events';
import type { ShippingData } from './types';

export const useShippingData = (): ShippingData => {
	const {
		shippingRates,
		needsShipping,
		hasCalculatedShipping,
		isLoadingRates,
		isCollectable,
		isSelectingRate,
	} = useSelect( ( select ) => {
		const store = select( cartStore );
		const rates = store.getShippingRates();
		return {
			shippingRates: rates,
			needsShipping: store.getNeedsShipping(),
			hasCalculatedShipping: store.getHasCalculatedShipping(),
			isLoadingRates: store.isAddressFieldsForShippingRatesUpdating(),
			isCollectable: rates.every(
				( { shipping_rates: packageShippingRates } ) =>
					packageShippingRates.find( ( { method_id: methodId } ) =>
						hasCollectableRate( methodId )
					)
			),
			isSelectingRate: store.isShippingRateBeingSelected(),
		};
	}, [] );

	// set selected rates on ref so it's always current.
	const selectedRates = useRef< Record< string, string > >( {} );
	useEffect( () => {
		const derivedSelectedRates =
			deriveSelectedShippingRates( shippingRates );
		if (
			isObject( derivedSelectedRates ) &&
			! isShallowEqual( selectedRates.current, derivedSelectedRates )
		) {
			selectedRates.current = derivedSelectedRates;
		}
	}, [ shippingRates ] );

	const { selectShippingRate: dispatchSelectShippingRate } = useDispatch(
		cartStore
	) as {
		selectShippingRate: unknown;
	} as {
		selectShippingRate: (
			newShippingRateId: string,
			packageId?: string | number | null
		) => Promise< unknown >;
	};

	const hasSelectedLocalPickup = hasCollectableRate(
		Object.values( selectedRates.current ).map(
			( rate ) => rate.split( ':' )[ 0 ]
		)
	);
	// Selects a shipping rate, fires an event, and catch any errors.
	const { dispatchCheckoutEvent } = useStoreEvents();
	const selectShippingRate = useCallback(
		(
			newShippingRateId: string,
			packageId?: string | number | undefined
		): void => {
			let selectPromise;

			if ( typeof newShippingRateId === 'undefined' ) {
				return;
			}

			/**
			 * Picking location handling
			 *
			 * Forces pickup location to be selected for all packages since we don't allow a mix of shipping and pickup.
			 */
			if ( hasCollectableRate( newShippingRateId.split( ':' )[ 0 ] ) ) {
				selectPromise = dispatchSelectShippingRate(
					newShippingRateId,
					null
				);
			} else {
				selectPromise = dispatchSelectShippingRate(
					newShippingRateId,
					packageId
				);
			}
			selectPromise
				.then( () => {
					dispatchCheckoutEvent( 'set-selected-shipping-rate', {
						shippingRateId: newShippingRateId,
					} );
				} )
				.catch( ( error ) => {
					processErrorResponse( error );
				} );
		},
		[ dispatchSelectShippingRate, dispatchCheckoutEvent ]
	);

	return {
		isSelectingRate,
		selectedRates: selectedRates.current,
		selectShippingRate,
		shippingRates,
		needsShipping,
		hasCalculatedShipping,
		isLoadingRates,
		isCollectable,
		hasSelectedLocalPickup,
	};
};
