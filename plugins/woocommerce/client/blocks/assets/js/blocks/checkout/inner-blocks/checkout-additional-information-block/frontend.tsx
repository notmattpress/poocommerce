/**
 * External dependencies
 */
import clsx from 'clsx';
import { FormStep } from '@poocommerce/blocks-components';
import { ORDER_FORM_KEYS } from '@poocommerce/block-settings';
import { useSelect } from '@wordpress/data';
import { checkoutStore } from '@poocommerce/block-data';
import { withFilteredAttributes } from '@poocommerce/shared-hocs';
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
	const checkoutIsProcessing = useSelect(
		( select ) => select( checkoutStore ).isProcessing(),
		[]
	);

	if ( ORDER_FORM_KEYS.length === 0 ) {
		return null;
	}

	return (
		<FormStep
			id="order-fields"
			disabled={ checkoutIsProcessing }
			className={ clsx( 'wc-block-checkout__order-fields', className ) }
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
