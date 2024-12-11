/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TotalsItem } from '@poocommerce/blocks-components';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import {
	usePaymentMethods,
	useStoreCart,
} from '@poocommerce/base-context/hooks';
import PaymentMethodIcons from '@poocommerce/base-components/cart-checkout/payment-method-icons';
import { getIconsFromPaymentMethods } from '@poocommerce/base-utils';
import { getSetting } from '@poocommerce/settings';
import { PaymentEventsProvider } from '@poocommerce/base-context';

/**
 * Internal dependencies
 */
import './editor.scss';

const PaymentMethodIconsElement = (): JSX.Element => {
	const { paymentMethods } = usePaymentMethods();
	return (
		<PaymentMethodIcons
			icons={ getIconsFromPaymentMethods( paymentMethods ) }
		/>
	);
};

export const Edit = (): JSX.Element => {
	const blockProps = useBlockProps();
	const { cartTotals } = useStoreCart();
	const subTotal = getSetting( 'displayCartPricesIncludingTax', false )
		? parseInt( cartTotals.total_items, 10 ) +
		  parseInt( cartTotals.total_items_tax, 10 )
		: parseInt( cartTotals.total_items, 10 );

	const TEMPLATE = [
		[ 'poocommerce/mini-cart-cart-button-block', {} ],
		[ 'poocommerce/mini-cart-checkout-button-block', {} ],
	];

	return (
		<div { ...blockProps }>
			<div className="wc-block-mini-cart__footer">
				<TotalsItem
					className="wc-block-mini-cart__footer-subtotal"
					currency={ getCurrencyFromPriceResponse( cartTotals ) }
					label={ __( 'Subtotal', 'poocommerce' ) }
					value={ subTotal }
					description={ __(
						'Shipping, taxes, and discounts calculated at checkout.',
						'poocommerce'
					) }
				/>
				<div className="wc-block-mini-cart__footer-actions">
					<InnerBlocks template={ TEMPLATE } />
				</div>
				<PaymentEventsProvider>
					<PaymentMethodIconsElement />
				</PaymentEventsProvider>
			</div>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</div>
	);
};
