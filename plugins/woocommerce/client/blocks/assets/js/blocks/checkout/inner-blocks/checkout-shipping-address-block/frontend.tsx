/**
 * External dependencies
 */
import clsx from 'clsx';
import { withFilteredAttributes } from '@poocommerce/shared-hocs';
import { FormStep } from '@poocommerce/blocks-components';
import { useCheckoutAddress } from '@poocommerce/base-context/hooks';
import { useSelect } from '@wordpress/data';
import { checkoutStore } from '@poocommerce/block-data';
/**
 * Internal dependencies
 */
import Block from './block';
import attributes from './attributes';
import { useCheckoutBlockContext } from '../../context';

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
	const checkoutIsProcessing = useSelect( ( select ) =>
		select( checkoutStore ).isProcessing()
	);
	const { showShippingFields } = useCheckoutAddress();
	const { showFormStepNumbers } = useCheckoutBlockContext();

	if ( ! showShippingFields ) {
		return null;
	}

	return (
		<FormStep
			id="shipping-fields"
			disabled={ checkoutIsProcessing }
			className={ clsx(
				'wc-block-checkout__shipping-fields',
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
