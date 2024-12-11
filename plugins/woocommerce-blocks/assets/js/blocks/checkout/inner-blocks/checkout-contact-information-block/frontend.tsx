/**
 * External dependencies
 */
import clsx from 'clsx';
import { withFilteredAttributes } from '@poocommerce/shared-hocs';
import { FormStep } from '@poocommerce/blocks-components';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
import { useCheckoutBlockContext } from '@poocommerce/blocks/checkout/context';

/**
 * Internal dependencies
 */
import Block from './block';
import attributes from './attributes';
import LoginPrompt from './login-prompt';

const FrontendBlock = ( {
	title,
	description,
	children,
	className,
}: {
	title: string;
	description: string;
	showStepNumber: boolean;
	children: JSX.Element;
	className?: string;
} ) => {
	const checkoutIsProcessing = useSelect( ( select ) =>
		select( CHECKOUT_STORE_KEY ).isProcessing()
	);

	const { showFormStepNumbers } = useCheckoutBlockContext();

	return (
		<FormStep
			id="contact-fields"
			disabled={ checkoutIsProcessing }
			className={ clsx( 'wc-block-checkout__contact-fields', className ) }
			title={ title }
			description={ description }
			showStepNumber={ showFormStepNumbers }
			stepHeadingContent={ () => <LoginPrompt /> }
		>
			<Block />
			{ children }
		</FormStep>
	);
};

export default withFilteredAttributes( attributes )( FrontendBlock );
