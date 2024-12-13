/**
 * External dependencies
 */
import clsx from 'clsx';
import { withFilteredAttributes } from '@poocommerce/shared-hocs';
import { FormStep } from '@poocommerce/blocks-components';
import { useCheckoutAddress } from '@poocommerce/base-context/hooks';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
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
	const { showShippingMethods } = useCheckoutAddress();

	if ( ! showShippingMethods ) {
		return null;
	}

	return (
		<FormStep
			id="shipping-option"
			disabled={ checkoutIsProcessing }
			className={ clsx(
				'wc-block-checkout__shipping-option',
				className
			) }
			title={ title }
			description={ description }
			showStepNumber={ showFormStepNumbers }
		>
			<Block />
			{ children }
		</FormStep>
	);
};

export default withFilteredAttributes( attributes )( FrontendBlock );
