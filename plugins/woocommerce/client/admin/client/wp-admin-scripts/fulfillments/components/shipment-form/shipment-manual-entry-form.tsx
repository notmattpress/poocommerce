/**
 * External dependencies
 */
import { ComboboxControl, TextControl } from '@wordpress/components';
import { ComboboxControlOption } from '@wordpress/components/build-types/combobox-control/types';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useShipmentFormContext } from '../../context/shipment-form-context';
import ShipmentProviders from '../../data/shipment-providers';
import { SearchIcon } from '../../utils/icons';

const ShippingProviderListItem = ( {
	item,
}: {
	item: ComboboxControlOption;
} ) => {
	return (
		<div
			className={ [
				'poocommerce-fulfillment-shipping-provider-list-item',
				'poocommerce-fulfillment-shipping-provider-list-item-' +
					item.value,
			].join( ' ' ) }
		>
			{ item.icon && (
				<div className="poocommerce-fulfillment-shipping-provider-list-item-icon">
					<img src={ item.icon } alt={ item.label } />
				</div>
			) }
			<div className="poocommerce-fulfillment-shipping-provider-list-item-label">
				{ item.label }
			</div>
		</div>
	);
};

export default function ShipmentManualEntryForm() {
	const {
		trackingNumber,
		setTrackingNumber,
		shipmentProvider,
		setShipmentProvider,
		providerName,
		setProviderName,
		trackingUrl,
		setTrackingUrl,
	} = useShipmentFormContext();
	return (
		<>
			<p className="poocommerce-fulfillment-description">
				{ __(
					'Provide the shipment information for this fulfillment.',
					'poocommerce'
				) }
			</p>
			<div className="poocommerce-fulfillment-input-container">
				<div className="poocommerce-fulfillment-input-group">
					<TextControl
						label={ __( 'Tracking Number', 'poocommerce' ) }
						type="text"
						placeholder={ __(
							'Enter tracking number',
							'poocommerce'
						) }
						value={ trackingNumber }
						onChange={ ( value: string ) => {
							setTrackingNumber( value );
						} }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</div>
			</div>
			<div className="poocommerce-fulfillment-input-container">
				<div className="poocommerce-fulfillment-input-group">
					<ComboboxControl
						label={ __( 'Provider', 'poocommerce' ) }
						__experimentalRenderItem={ ( { item } ) => (
							<ShippingProviderListItem item={ item } />
						) }
						allowReset={ false }
						__next40pxDefaultSize
						value={ shipmentProvider }
						options={ ShipmentProviders }
						onChange={ ( value ) => {
							if ( typeof value !== 'string' ) {
								return;
							}
							if ( ! value ) {
								setTrackingUrl( '' );
								return;
							}
							setShipmentProvider( value as string );
							setTrackingUrl(
								(
									window.wcFulfillmentSettings.providers[
										value as string
									]?.url ?? ''
								).replace(
									/__placeholder__/i,
									encodeURIComponent( trackingNumber ?? '' )
								)
							);
						} }
						__nextHasNoMarginBottom
					/>
					<div className="poocommerce-fulfillment-shipment-provider-search-icon">
						<SearchIcon />
					</div>
				</div>
			</div>
			{ shipmentProvider === 'other' && (
				<div className="poocommerce-fulfillment-input-container">
					<div className="poocommerce-fulfillment-input-group">
						<TextControl
							label={ __( 'Provider Name', 'poocommerce' ) }
							type="text"
							placeholder={ __(
								'Enter provider name',
								'poocommerce'
							) }
							value={ providerName }
							onChange={ ( value: string ) => {
								setProviderName( value );
							} }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</div>
				</div>
			) }
			<div className="poocommerce-fulfillment-input-container">
				<div className="poocommerce-fulfillment-input-group">
					<TextControl
						label={ __( 'Tracking URL', 'poocommerce' ) }
						type="text"
						placeholder={ __(
							'Enter tracking URL',
							'poocommerce'
						) }
						value={ trackingUrl }
						onChange={ ( value: string ) => {
							setTrackingUrl( value );
						} }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</div>
			</div>
		</>
	);
}
