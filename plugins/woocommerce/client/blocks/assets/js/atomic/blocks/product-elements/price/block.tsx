/**
 * External dependencies
 */
import clsx from 'clsx';
import ProductPrice from '@poocommerce/base-components/product-price';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@poocommerce/shared-context';
import { useStyleProps } from '@poocommerce/base-hooks';
import { withProductDataContext } from '@poocommerce/shared-hocs';
import { CurrencyCode } from '@poocommerce/type-defs/currency';
import type { HTMLAttributes } from 'react';

/**
 * Internal dependencies
 */
import type { BlockAttributes } from './types';

type Props = BlockAttributes & HTMLAttributes< HTMLDivElement >;

interface PriceProps {
	currency_code: CurrencyCode;
	currency_symbol: string;
	currency_minor_unit: number;
	currency_decimal_separator: string;
	currency_thousand_separator: string;
	currency_prefix: string;
	currency_suffix: string;
	price: string;
	regular_price: string;
	sale_price: string;
	price_range: null | { min_amount: string; max_amount: string };
}

export const Block = ( props: Props ): JSX.Element | null => {
	const { className, textAlign, isDescendentOfSingleProductTemplate } = props;
	const styleProps = useStyleProps( props );
	const { parentName, parentClassName } = useInnerBlockLayoutContext();
	const { product } = useProductDataContext();

	const isDescendentOfAllProductsBlock =
		parentName === 'poocommerce/all-products';
	const isDescendentOfAddToCartGroupedProductSelectorBlock =
		parentName ===
		'poocommerce/add-to-cart-with-options-grouped-product-item';

	const showPricePreview =
		isDescendentOfSingleProductTemplate &&
		! isDescendentOfAddToCartGroupedProductSelectorBlock;

	const wrapperClassName = clsx(
		'wc-block-components-product-price',
		className,
		styleProps.className,
		{
			[ `${ parentClassName }__product-price` ]: parentClassName,
		}
	);

	if ( ! product.id && ! isDescendentOfSingleProductTemplate ) {
		const productPriceComponent = (
			<ProductPrice align={ textAlign } className={ wrapperClassName } />
		);
		if ( isDescendentOfAllProductsBlock ) {
			return (
				<div className="wp-block-poocommerce-product-price">
					{ productPriceComponent }
				</div>
			);
		}
		return productPriceComponent;
	}

	const prices: PriceProps = product.prices;
	const currency = showPricePreview
		? getCurrencyFromPriceResponse()
		: getCurrencyFromPriceResponse( prices );

	const pricePreview = '5000';
	const isOnSale = prices.price !== prices.regular_price;
	const priceClassName = clsx( {
		[ `${ parentClassName }__product-price__value` ]: parentClassName,
		[ `${ parentClassName }__product-price__value--on-sale` ]: isOnSale,
	} );

	const productPriceComponent = (
		<ProductPrice
			align={ textAlign }
			className={ wrapperClassName }
			style={ styleProps.style }
			regularPriceStyle={ styleProps.style }
			priceStyle={ styleProps.style }
			priceClassName={ priceClassName }
			currency={ currency }
			price={ showPricePreview ? pricePreview : prices.price }
			// Range price props
			minPrice={ prices?.price_range?.min_amount }
			maxPrice={ prices?.price_range?.max_amount }
			// This is the regular or original price when the `price` value is a sale price.
			regularPrice={
				showPricePreview ? pricePreview : prices.regular_price
			}
			regularPriceClassName={ clsx( {
				[ `${ parentClassName }__product-price__regular` ]:
					parentClassName,
			} ) }
		/>
	);
	if ( isDescendentOfAllProductsBlock ) {
		return (
			<div className="wp-block-poocommerce-product-price">
				{ productPriceComponent }
			</div>
		);
	}
	return productPriceComponent;
};

export default ( props: Props ) => {
	// It is necessary because this block has to support several contexts:
	// - Inside `All Products Block` -> `withProductDataContext` HOC
	// - Inside `Products Block` -> Gutenberg Context
	// - Inside `Single Product Template` -> Gutenberg Context
	// - Without any parent -> `WithSelector` and `withProductDataContext` HOCs
	// For more details, check https://github.com/poocommerce/poocommerce-blocks/pull/8609
	if ( props.isDescendentOfSingleProductTemplate ) {
		return <Block { ...props } />;
	}
	return withProductDataContext( Block )( props );
};
