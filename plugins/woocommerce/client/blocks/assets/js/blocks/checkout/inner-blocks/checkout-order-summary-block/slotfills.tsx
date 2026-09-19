/**
 * External dependencies
 */
import {
	ExperimentalOrderMeta,
	createSlotFill,
} from '@poocommerce/blocks-checkout';
import { useStoreCart } from '@poocommerce/base-context/hooks';

// @todo Consider deprecating OrderMetaSlotFill and DiscountSlotFill in favour of inner block areas.
export const OrderMetaSlotFill = (): JSX.Element => {
	// Prepare props to pass to the ExperimentalOrderMeta slot fill. We need to pluck out receiveCart.
	// eslint-disable-next-line no-unused-vars
	const { extensions, receiveCart, ...cart } = useStoreCart();
	const slotFillProps = {
		extensions,
		cart,
		context: 'poocommerce/checkout',
	};

	return <ExperimentalOrderMeta.Slot { ...slotFillProps } />;
};

const checkoutOrderSummarySlotName = 'checkoutOrderSummaryActionArea';

export const {
	Fill: CheckoutOrderSummaryFill,
	Slot: CheckoutOrderSummarySlot,
} = createSlotFill( checkoutOrderSummarySlotName );
