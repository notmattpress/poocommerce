/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { createInterpolateElement } from '@wordpress/element';
import {
	FormattedMonetaryAmount,
	TotalsItem,
} from '@poocommerce/blocks-components';
import {
	applyCheckoutFilter,
	productPriceValidation,
} from '@poocommerce/blocks-checkout';
import {
	useStoreCart,
	useOrderSummaryLoadingState,
} from '@poocommerce/base-context/hooks';
import { getSetting } from '@poocommerce/settings';
import {
	CartResponseTotals,
	Currency,
	LooselyMustHave,
} from '@poocommerce/types';
import { formatPrice } from '@poocommerce/price-format';
import { hasSelectedShippingRate } from '@poocommerce/base-utils';
import { Skeleton } from '@poocommerce/base-components/skeleton';
import { DelayedContentWithSkeleton } from '@poocommerce/base-components/delayed-content-with-skeleton';

/**
 * Internal dependencies
 */
import './style.scss';

export interface TotalsFooterItemProps {
	className?: string;
	/**
	 * The currency object with which to display the item
	 */
	currency: Currency;
	/**
	 * Whether the totals are estimated e.g. in the cart.
	 */
	isEstimate?: boolean;
	/**
	 * An object containing the total price and the total tax
	 *
	 * It accepts the entire `CartResponseTotals` to be passed, for
	 * convenience, but will use only these two properties.
	 */
	values: LooselyMustHave< CartResponseTotals, 'total_price' | 'total_tax' >;
}

/**
 * The total at the bottom of the cart
 *
 * Can show how much of the total is in taxes if the settings
 * `taxesEnabled` and `displayCartPricesIncludingTax` are both
 * enabled.
 */
const TotalsFooterItem = ( {
	currency,
	values,
	className,
	isEstimate = false,
}: TotalsFooterItemProps ): JSX.Element => {
	const SHOW_TAXES =
		getSetting< boolean >( 'taxesEnabled', true ) &&
		getSetting< boolean >( 'displayCartPricesIncludingTax', false );

	const {
		total_price: totalPrice,
		total_tax: totalTax,
		tax_lines: taxLines,
	} = values;

	// Prepare props to pass to the applyCheckoutFilter filter.
	// We need to pluck out receiveCart.
	// eslint-disable-next-line no-unused-vars
	const { receiveCart, ...cart } = useStoreCart();
	const { isLoading } = useOrderSummaryLoadingState();

	const label = applyCheckoutFilter( {
		filterName: 'totalLabel',
		defaultValue: isEstimate
			? __( 'Estimated total', 'poocommerce' )
			: __( 'Total', 'poocommerce' ),
		extensions: cart.extensions,
		arg: { cart },
	} );

	const totalValue = applyCheckoutFilter( {
		filterName: 'totalValue',
		defaultValue: '<price/>',
		extensions: cart.extensions,
		arg: { cart },
		validation: productPriceValidation,
	} );

	const priceComponent = (
		<FormattedMonetaryAmount
			className="wc-block-components-totals-footer-item-tax-value"
			currency={ currency }
			value={ parseInt( totalPrice, 10 ) }
		/>
	);

	const value = createInterpolateElement( totalValue, {
		price: priceComponent,
	} );

	const parsedTaxValue = parseInt( totalTax, 10 );

	const description =
		taxLines && taxLines.length > 0
			? sprintf(
					/* translators: %s is a list of tax rates */
					__( 'Including %s', 'poocommerce' ),
					taxLines
						.map( ( { name, price } ) => {
							return `${ formatPrice(
								price,
								currency
							) } ${ name }`;
						} )
						.join( ', ' )
			  )
			: __( 'Including <TaxAmount/> in taxes', 'poocommerce' );

	const hasSelectedRates = hasSelectedShippingRate( cart.shippingRates );
	const cartNeedsShipping = cart.cartNeedsShipping;
	const skeleton = (
		<>
			<span>{ __( 'Including', 'poocommerce' ) }</span>
			<Skeleton
				height="1em"
				width="45px"
				tag="span"
				ariaMessage={ __( 'Loading price… ', 'poocommerce' ) }
			/>
		</>
	);

	return (
		<TotalsItem
			className={ clsx(
				'wc-block-components-totals-footer-item',
				className
			) }
			currency={ currency }
			label={ label }
			value={ value }
			description={
				<>
					{ SHOW_TAXES && parsedTaxValue !== 0 && (
						<p className="wc-block-components-totals-footer-item-tax">
							<DelayedContentWithSkeleton
								isLoading={ isLoading }
								skeleton={ skeleton }
							>
								<>
									{ createInterpolateElement( description, {
										TaxAmount: (
											<FormattedMonetaryAmount
												className="wc-block-components-totals-footer-item-tax-value"
												currency={ currency }
												value={ parsedTaxValue }
											/>
										),
									} ) }
								</>
							</DelayedContentWithSkeleton>
						</p>
					) }
					{ isEstimate && ! hasSelectedRates && cartNeedsShipping && (
						<p className="wc-block-components-totals-footer-item-shipping">
							{ __(
								'Shipping will be calculated at checkout',
								'poocommerce'
							) }
						</p>
					) }
				</>
			}
			showSkeleton={ isLoading }
		/>
	);
};

export default TotalsFooterItem;
