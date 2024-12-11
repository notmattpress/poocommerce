/* eslint-disable no-nested-ternary */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getSetting } from '@poocommerce/settings';
import { createInterpolateElement } from '@wordpress/element';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { FormattedMonetaryAmount } from '@poocommerce/blocks-components';
import type { CartShippingPackageShippingRate } from '@poocommerce/type-defs/cart';

export const RatePrice = ( {
	minRate,
	maxRate,
	multiple = false,
}: {
	minRate: CartShippingPackageShippingRate | undefined;
	maxRate: CartShippingPackageShippingRate | undefined;
	multiple?: boolean;
} ) => {
	if ( minRate === undefined || maxRate === undefined ) {
		return null;
	}
	const minRatePrice = getSetting( 'displayCartPricesIncludingTax', false )
		? parseInt( minRate.price, 10 ) + parseInt( minRate.taxes, 10 )
		: parseInt( minRate.price, 10 );
	const maxRatePrice = getSetting( 'displayCartPricesIncludingTax', false )
		? parseInt( maxRate.price, 10 ) + parseInt( maxRate.taxes, 10 )
		: parseInt( maxRate.price, 10 );
	const priceElement =
		minRatePrice === 0 ? (
			<em>{ __( 'free', 'poocommerce' ) }</em>
		) : (
			<FormattedMonetaryAmount
				currency={ getCurrencyFromPriceResponse( minRate ) }
				value={ minRatePrice }
			/>
		);

	return (
		<span className="wc-block-checkout__shipping-method-option-price">
			{ minRatePrice === maxRatePrice && ! multiple
				? priceElement
				: createInterpolateElement(
						minRatePrice === 0 && maxRatePrice === 0
							? '<price />'
							: __( 'from <price />', 'poocommerce' ),
						{
							price: priceElement,
						}
				  ) }
		</span>
	);
};
