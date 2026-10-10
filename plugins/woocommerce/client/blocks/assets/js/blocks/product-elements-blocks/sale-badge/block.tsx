/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	formatPrice,
	getCurrencyFromPriceResponse,
} from '@poocommerce/price-format';
import clsx from 'clsx';
import { Label } from '@poocommerce/blocks-components';
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@poocommerce/shared-context';
import { useStyleProps } from '@poocommerce/base-hooks';
import { withProductDataContext } from '@poocommerce/shared-hocs';
import type { HTMLAttributes, ReactElement } from 'react';

/**
 * Internal dependencies
 */
import './style.scss';
import type { BlockAttributes } from './types';

type Props = BlockAttributes &
	HTMLAttributes< HTMLDivElement > & {
		align: boolean;
		isDescendentOfSingleProductTemplate: boolean;
	};

export const Block = ( props: Props ): ReactElement | null => {
	const { className, align, isDescendentOfSingleProductTemplate } = props;
	const styleProps = useStyleProps( props );
	const { parentClassName } = useInnerBlockLayoutContext();
	const { product } = useProductDataContext();

	/**
	 * Only show sale badge for products that are on sale.
	 * Always show in templates for preview purposes.
	 */
	if (
		( ! product.id || ! product.on_sale ) &&
		! isDescendentOfSingleProductTemplate
	) {
		return null;
	}

	const isNumeric =
		props.badgeContent === 'amount' || props.badgeContent === 'percentage';

	let label = props.saleText || __( 'Sale', 'poocommerce' );
	if ( isNumeric && product.type !== 'grouped' ) {
		const prices = 'prices' in product ? product.prices : undefined;
		const regular = Number( prices?.regular_price );
		const price = Number( prices?.price );
		if ( regular > 0 && price < regular ) {
			const discount = regular - price;
			const percentage = Math.round( ( discount / regular ) * 100 );
			if ( props.badgeContent === 'percentage' && percentage === 0 ) {
				return null;
			}
			const value =
				props.badgeContent === 'percentage'
					? sprintf(
							/* translators: %s: discount percentage. %% is the percent sign. */
							__( '%s%%', 'poocommerce' ),
							percentage
						)
					: formatPrice(
							discount,
							getCurrencyFromPriceResponse( prices )
						);
			// Parent prices are independent minima, so the editor preview may differ from the largest variation discount.
			label =
				product.type === 'variable'
					? sprintf(
							/* translators: %s: approximate discount for a variable product in the editor. */
							__( 'Up to %s', 'poocommerce' ),
							value
						)
					: `${ props.prefix ?? '' }${ value }${
							props.suffix ?? ''
						}`;
		}
	}

	const alignClass =
		typeof align === 'string'
			? `wc-block-components-product-sale-badge--align-${ align }`
			: '';

	return (
		<div
			className={ clsx(
				'wc-block-components-product-sale-badge',
				className,
				alignClass,
				{
					[ `${ parentClassName }__product-onsale` ]: parentClassName,
				},
				styleProps.className
			) }
			style={ styleProps.style }
		>
			<Label
				label={ label }
				screenReaderLabel={ sprintf(
					/* translators: %s: sale badge text. */
					__( 'Product on sale: %s', 'poocommerce' ),
					label
				) }
			/>
		</div>
	);
};

export default withProductDataContext( Block );
