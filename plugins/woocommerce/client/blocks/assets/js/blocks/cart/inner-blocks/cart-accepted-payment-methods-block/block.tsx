/**
 * External dependencies
 */
import { PaymentMethodIcons } from '@poocommerce/base-components/cart-checkout';
import { usePaymentMethods } from '@poocommerce/base-context/hooks';
import { getIconsFromPaymentMethods } from '@poocommerce/base-utils';

const Block = ( { className }: { className: string } ): JSX.Element => {
	const { paymentMethods } = usePaymentMethods();

	return (
		<PaymentMethodIcons
			className={ className }
			icons={ getIconsFromPaymentMethods( paymentMethods ) }
		/>
	);
};

export default Block;
