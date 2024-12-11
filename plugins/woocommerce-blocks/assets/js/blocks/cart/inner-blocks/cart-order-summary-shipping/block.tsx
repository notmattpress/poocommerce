/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { TotalsShipping } from '@poocommerce/base-components/cart-checkout';
import { ShippingCalculatorContext } from '@poocommerce/base-components/cart-checkout/shipping-calculator/context';
import { useEditorContext, useStoreCart } from '@poocommerce/base-context';
import { TotalsWrapper } from '@poocommerce/blocks-checkout';
import {
	getShippingRatesPackageCount,
	selectedRatesAreCollectable,
	allRatesAreCollectable,
} from '@poocommerce/base-utils';
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { ShippingRateSelector } from './shipping-rate-selector';

const Block = ( { className }: { className: string } ): JSX.Element | null => {
	const { isEditor } = useEditorContext();
	const { cartNeedsShipping, shippingRates } = useStoreCart();
	const [ isShippingCalculatorOpen, setIsShippingCalculatorOpen ] =
		useState( false );

	if ( ! cartNeedsShipping ) {
		return null;
	}

	if ( isEditor && getShippingRatesPackageCount( shippingRates ) === 0 ) {
		return null;
	}

	const showCalculator = getSetting< boolean >(
		'isShippingCalculatorEnabled',
		true
	);

	const hasSelectedCollectionOnly =
		selectedRatesAreCollectable( shippingRates );

	return (
		<TotalsWrapper className={ className }>
			<ShippingCalculatorContext.Provider
				value={ {
					showCalculator,
					shippingCalculatorID: 'shipping-calculator-form-wrapper',
					isShippingCalculatorOpen,
					setIsShippingCalculatorOpen,
				} }
			>
				<TotalsShipping
					label={
						hasSelectedCollectionOnly
							? __( 'Collection', 'poocommerce' )
							: __( 'Delivery', 'poocommerce' )
					}
					placeholder={
						! showCalculator ? (
							<span className="wc-block-components-shipping-placeholder__value">
								{ __(
									'Calculated at checkout',
									'poocommerce'
								) }
							</span>
						) : null
					}
					collaterals={
						<>
							<ShippingRateSelector />
							{ ! showCalculator &&
								allRatesAreCollectable( shippingRates ) && (
									<div className="wc-block-components-totals-shipping__delivery-options-notice">
										{ __(
											'Delivery options will be calculated during checkout',
											'poocommerce'
										) }
									</div>
								) }
						</>
					}
				/>
			</ShippingCalculatorContext.Provider>
		</TotalsWrapper>
	);
};

export default Block;
