/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import {
	type OfflinePaymentMethodProvider,
	paymentSettingsStore,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import './settings-payments-offline.scss';
import './settings-payments-body.scss';
import { ListPlaceholder } from '~/settings-payments/components/list-placeholder';
import { OfflinePaymentGatewayList } from '~/settings-payments/components/offline-payment-gateway-list';

/**
 * A component for managing offline payment gateways in PooCommerce.
 * It retrieves and displays a list of offline payment gateways,
 * allows users to reorder them, and updates the order in the store.
 */
export const SettingsPaymentsOffline = () => {
	// Retrieve offline payment gateways and loading state from the store.
	const { offlinePaymentGateways, isFetching } = useSelect( ( select ) => {
		const paymentSettings = select( paymentSettingsStore );
		return {
			offlinePaymentGateways: paymentSettings.getOfflinePaymentGateways(),
			isFetching: paymentSettings.isFetching(),
		};
	}, [] );

	// Dispatch function to update the ordering of payment gateways.
	const { updateProviderOrdering } = useDispatch( paymentSettingsStore );
	// State to hold the sorted gateways in case of changing the order, otherwise it will be null.
	const [ sortedOfflinePaymentGateways, setSortedOfflinePaymentGateways ] =
		useState< OfflinePaymentMethodProvider[] | null >( null );

	/**
	 * Clear sortedOfflinePaymentGateways when data store updates.
	 */
	useEffect( () => {
		setSortedOfflinePaymentGateways( null );
	}, [ offlinePaymentGateways ] );

	/**
	 * Handles updating the order of offline payment gateways.
	 */
	function handleOrderingUpdate( sorted: OfflinePaymentMethodProvider[] ) {
		// Extract the existing _order values in the sorted order.
		const updatedOrderValues = sorted
			.map( ( gateway ) => gateway._order )
			.sort( ( a, b ) => a - b );

		// Build the orderMap by assigning the sorted _order values.
		const orderMap: Record< string, number > = {};
		sorted.forEach( ( gateway, index ) => {
			orderMap[ gateway.id ] = updatedOrderValues[ index ];
		} );

		updateProviderOrdering( orderMap );

		// Set the sorted providers to the state to give a real-time update.
		setSortedOfflinePaymentGateways( sorted );
	}

	return (
		<>
			{ isFetching ? (
				<ListPlaceholder rows={ 3 } />
			) : (
				<OfflinePaymentGatewayList
					gateways={
						sortedOfflinePaymentGateways || offlinePaymentGateways
					}
					setGateways={ handleOrderingUpdate }
				/>
			) }
		</>
	);
};

export default SettingsPaymentsOffline;
