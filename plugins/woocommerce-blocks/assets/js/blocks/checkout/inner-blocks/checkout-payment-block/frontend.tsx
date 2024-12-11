/**
 * External dependencies
 */
import clsx from 'clsx';
import { useStoreCart } from '@poocommerce/base-context/hooks';
import { withFilteredAttributes } from '@poocommerce/shared-hocs';
import {
	FormStep,
	StoreNoticesContainer,
} from '@poocommerce/blocks-components';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
import { noticeContexts } from '@poocommerce/base-context';
import { useCheckoutBlockContext } from '@poocommerce/blocks/checkout/context';

/**
 * Internal dependencies
 */
import Block from './block';
import attributes from './attributes';

const FrontendBlock = ( {
	title,
	description,
	children,
	className,
}: {
	title: string;
	description: string;
	children: JSX.Element;
	className?: string;
} ) => {
	const { showFormStepNumbers } = useCheckoutBlockContext();
	const checkoutIsProcessing = useSelect( ( select ) =>
		select( CHECKOUT_STORE_KEY ).isProcessing()
	);
	const { cartNeedsPayment } = useStoreCart();

	if ( ! cartNeedsPayment ) {
		return null;
	}
	return (
		<FormStep
			id="payment-method"
			disabled={ checkoutIsProcessing }
			className={ clsx( 'wc-block-checkout__payment-method', className ) }
			title={ title }
			description={ description }
			showStepNumber={ showFormStepNumbers }
		>
			<StoreNoticesContainer context={ noticeContexts.PAYMENTS } />
			<Block />
			{ children }
		</FormStep>
	);
};

export default withFilteredAttributes( attributes )( FrontendBlock );
