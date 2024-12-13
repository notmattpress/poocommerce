/**
 * External dependencies
 */
import clsx from 'clsx';
import { getSetting } from '@poocommerce/settings';
import {
	PlaceOrderButton,
	ReturnToCartButton,
} from '@poocommerce/base-components/cart-checkout';
import { useCheckoutSubmit } from '@poocommerce/base-context/hooks';
import { noticeContexts } from '@poocommerce/base-context';
import { StoreNoticesContainer } from '@poocommerce/blocks-components';
import { applyCheckoutFilter } from '@poocommerce/blocks-checkout';

/**
 * Internal dependencies
 */
import { defaultPlaceOrderButtonLabel } from './constants';
import './style.scss';

export type BlockAttributes = {
	cartPageId: number;
	showReturnToCart: boolean;
	className?: string;
	placeOrderButtonLabel: string;
	priceSeparator: string;
	returnToCartButtonLabel: string;
};

const Block = ( {
	cartPageId,
	showReturnToCart,
	className,
	placeOrderButtonLabel,
	returnToCartButtonLabel,
	priceSeparator,
}: {
	cartPageId: number;
	showReturnToCart: boolean;
	className?: string;
	placeOrderButtonLabel: string;
} ): JSX.Element => {
	const { paymentMethodButtonLabel } = useCheckoutSubmit();

	const label = applyCheckoutFilter( {
		filterName: 'placeOrderButtonLabel',
		defaultValue:
			paymentMethodButtonLabel ||
			placeOrderButtonLabel ||
			defaultPlaceOrderButtonLabel,
	} );

	const showPrice = className?.includes( 'is-style-with-price' ) || false;

	return (
		<div className={ clsx( 'wc-block-checkout__actions', className ) }>
			<StoreNoticesContainer
				context={ noticeContexts.CHECKOUT_ACTIONS }
			/>
			<div className="wc-block-checkout__actions_row">
				{ showReturnToCart && (
					<ReturnToCartButton
						href={ getSetting( 'page-' + cartPageId, false ) }
					>
						{ returnToCartButtonLabel }
					</ReturnToCartButton>
				) }
				{ showPrice && (
					<style>
						{ `.wp-block-poocommerce-checkout-actions-block {
						.wc-block-components-checkout-place-order-button__separator {
							&::after {
								content: "${ priceSeparator }";
							}
						}
					}` }
					</style>
				) }
				<PlaceOrderButton
					label={ label }
					fullWidth={ ! showReturnToCart }
					showPrice={ showPrice }
					priceSeparator={ priceSeparator }
				/>
			</div>
		</div>
	);
};

export default Block;
