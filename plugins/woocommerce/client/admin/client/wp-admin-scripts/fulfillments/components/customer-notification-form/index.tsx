/**
 * External dependencies
 */
import { useEffect, useMemo, useRef } from 'react';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import FulfillmentCard from '../user-interface/fulfillments-card/card';
import { EnvelopeIcon } from '../../utils/icons';
import { useFulfillmentContext } from '../../context/fulfillment-context';

/**
 * Internal dependencies
 */

export default function CustomerNotificationBox( {
	type = 'fulfill',
}: {
	type: 'fulfill' | 'update' | 'remove';
} ) {
	const { notifyCustomer, setNotifyCustomer } = useFulfillmentContext();
	const toggleRef = useRef< HTMLInputElement >( null );

	const headerStrings = useMemo( () => {
		return {
			fulfill: __( 'Fulfillment notification', 'poocommerce' ),
			remove: __( 'Removal update', 'poocommerce' ),
			update: __( 'Update notification', 'poocommerce' ),
		};
	}, [] );

	const contentStrings = useMemo( () => {
		return {
			fulfill: __(
				'Automatically send an email to the customer when the selected items are fulfilled.',
				'poocommerce'
			),
			remove: __(
				'Automatically send an email to the customer notifying that the fulfillment is cancelled.',
				'poocommerce'
			),
			update: __(
				'Automatically send an email to the customer when the fulfillment is updated.',
				'poocommerce'
			),
		};
	}, [] );

	const descriptionId = 'notification-description';

	useEffect( () => {
		if ( toggleRef.current ) {
			toggleRef.current.ariaLabel =
				headerStrings[ type ] || headerStrings.fulfill;
			toggleRef.current.setAttribute( 'aria-describedby', descriptionId );
		}
	}, [ type, headerStrings ] );

	return (
		<FulfillmentCard
			size="small"
			isCollapsable={ false }
			initialState="expanded"
			header={
				<>
					<EnvelopeIcon />
					<h3>{ headerStrings[ type ] || headerStrings.fulfill }</h3>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={ notifyCustomer }
						label={ '' }
						ref={ toggleRef }
						onChange={ ( checked ) => {
							setNotifyCustomer( checked );
						} }
					/>
				</>
			}
		>
			<p
				id={ descriptionId }
				className="poocommerce-fulfillment-description"
			>
				{ contentStrings[ type ] || contentStrings.fulfill }
			</p>
		</FulfillmentCard>
	);
}
