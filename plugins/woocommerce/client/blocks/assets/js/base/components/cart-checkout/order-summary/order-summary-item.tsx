/**
 * External dependencies
 */
import clsx from 'clsx';
import { sprintf, _n } from '@wordpress/i18n';
import { Label } from '@poocommerce/blocks-components';
import ProductPrice from '@poocommerce/base-components/product-price';
import ProductName from '@poocommerce/base-components/product-name';
import {
	getCurrencyFromPriceResponse,
	formatPrice,
} from '@poocommerce/price-format';
import {
	applyCheckoutFilter,
	productPriceValidation,
} from '@poocommerce/blocks-checkout';
import Dinero from 'dinero.js';
import { getSetting } from '@poocommerce/settings';
import { useMemo } from '@wordpress/element';
import { useStoreCart } from '@poocommerce/base-context/hooks';
import { CartItem, isString } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import ProductBackorderBadge from '../product-backorder-badge';
import ProductImage from '../product-image';
import ProductLowStockBadge from '../product-low-stock-badge';
import ProductMetadata from '../product-metadata';

interface OrderSummaryProps {
	cartItem: CartItem;
	disableProductDescriptions: boolean;
}

const OrderSummaryItem = ( {
	cartItem,
	disableProductDescriptions,
}: OrderSummaryProps ): JSX.Element => {
	const {
		images,
		low_stock_remaining: lowStockRemaining,
		show_backorder_badge: showBackorderBadge,
		name: initialName,
		permalink,
		prices,
		quantity,
		short_description: shortDescription,
		description: fullDescription,
		item_data: itemData,
		variation,
		totals,
		extensions,
	} = cartItem;

	// Prepare props to pass to the applyCheckoutFilter filter.
	// We need to pluck out receiveCart.
	// eslint-disable-next-line no-unused-vars
	const { receiveCart, ...cart } = useStoreCart();

	const arg = useMemo(
		() => ( {
			context: 'summary',
			cartItem,
			cart,
		} ),
		[ cartItem, cart ]
	);

	const priceCurrency = getCurrencyFromPriceResponse( prices );

	const name = applyCheckoutFilter( {
		filterName: 'itemName',
		defaultValue: initialName,
		extensions,
		arg,
	} );

	const regularPriceSingle = Dinero( {
		amount: parseInt( prices.raw_prices.regular_price, 10 ),
		precision: isString( prices.raw_prices.precision )
			? parseInt( prices.raw_prices.precision, 10 )
			: prices.raw_prices.precision,
	} )
		.convertPrecision( priceCurrency.minorUnit )
		.getAmount();
	const priceSingle = Dinero( {
		amount: parseInt( prices.raw_prices.price, 10 ),
		precision: isString( prices.raw_prices.precision )
			? parseInt( prices.raw_prices.precision, 10 )
			: prices.raw_prices.precision,
	} )
		.convertPrecision( priceCurrency.minorUnit )
		.getAmount();
	const totalsCurrency = getCurrencyFromPriceResponse( totals );

	let lineSubtotal = parseInt( totals.line_subtotal, 10 );
	if ( getSetting( 'displayCartPricesIncludingTax', false ) ) {
		lineSubtotal += parseInt( totals.line_subtotal_tax, 10 );
	}
	const subtotalPrice = Dinero( {
		amount: lineSubtotal,
		precision: totalsCurrency.minorUnit,
	} ).getAmount();
	const subtotalPriceFormat = applyCheckoutFilter( {
		filterName: 'subtotalPriceFormat',
		defaultValue: '<price/>',
		extensions,
		arg,
		validation: productPriceValidation,
	} );

	// Allow extensions to filter how the price is displayed. Ie: prepending or appending some values.
	const productPriceFormat = applyCheckoutFilter( {
		filterName: 'cartItemPrice',
		defaultValue: '<price/>',
		extensions,
		arg,
		validation: productPriceValidation,
	} );

	const cartItemClassNameFilter = applyCheckoutFilter( {
		filterName: 'cartItemClass',
		defaultValue: '',
		extensions,
		arg,
	} );

	const productMetaProps = disableProductDescriptions
		? {
				itemData,
				variation,
		  }
		: {
				itemData,
				variation,
				shortDescription,
				fullDescription,
		  };

	return (
		<div
			className={ clsx(
				'wc-block-components-order-summary-item',
				cartItemClassNameFilter
			) }
		>
			<div className="wc-block-components-order-summary-item__image">
				<div className="wc-block-components-order-summary-item__quantity">
					<Label
						label={ quantity.toString() }
						screenReaderLabel={ sprintf(
							/* translators: %d number of products of the same type in the cart */
							_n(
								'%d item',
								'%d items',
								quantity,
								'poocommerce'
							),
							quantity
						) }
					/>
				</div>
				<ProductImage
					image={ images.length ? images[ 0 ] : {} }
					fallbackAlt={ name }
					width={ 48 }
					height={ 48 }
				/>
			</div>
			<div className="wc-block-components-order-summary-item__description">
				<ProductName
					disabled={ true }
					name={ name }
					permalink={ permalink }
					disabledTagName="h3"
				/>
				<ProductPrice
					currency={ priceCurrency }
					price={ priceSingle }
					regularPrice={ regularPriceSingle }
					className="wc-block-components-order-summary-item__individual-prices"
					priceClassName="wc-block-components-order-summary-item__individual-price"
					regularPriceClassName="wc-block-components-order-summary-item__regular-individual-price"
					format={ subtotalPriceFormat }
				/>
				{ showBackorderBadge ? (
					<ProductBackorderBadge />
				) : (
					!! lowStockRemaining && (
						<ProductLowStockBadge
							lowStockRemaining={ lowStockRemaining }
						/>
					)
				) }
				<ProductMetadata { ...productMetaProps } />
			</div>
			<span className="screen-reader-text">
				{ sprintf(
					/* translators: %1$d is the number of items, %2$s is the item name and %3$s is the total price including the currency symbol. */
					_n(
						'Total price for %1$d %2$s item: %3$s',
						'Total price for %1$d %2$s items: %3$s',
						quantity,
						'poocommerce'
					),
					quantity,
					name,
					formatPrice( subtotalPrice, totalsCurrency )
				) }
			</span>
			<div
				className="wc-block-components-order-summary-item__total-price"
				aria-hidden="true"
			>
				<ProductPrice
					currency={ totalsCurrency }
					format={ productPriceFormat }
					price={ subtotalPrice }
				/>
			</div>
		</div>
	);
};

export default OrderSummaryItem;
