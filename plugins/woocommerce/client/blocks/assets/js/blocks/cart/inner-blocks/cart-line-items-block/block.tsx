/**
 * External dependencies
 */
import { useStoreCart } from '@poocommerce/base-context/hooks';
import { CartLineItemsTable } from '@poocommerce/base-components/cart-checkout';

const Block = ( { className }: { className: string } ): JSX.Element => {
	const { cartItems, cartIsLoading } = useStoreCart();
	return (
		<CartLineItemsTable
			className={ className }
			lineItems={ cartItems }
			isLoading={ cartIsLoading }
		/>
	);
};

export default Block;
