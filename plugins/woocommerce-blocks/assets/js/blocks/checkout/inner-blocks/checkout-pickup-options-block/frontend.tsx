/**
 * External dependencies
 */
import clsx from 'clsx';
import { withFilteredAttributes } from '@poocommerce/shared-hocs';
import { FormStep } from '@poocommerce/blocks-components';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
import { LOCAL_PICKUP_ENABLED } from '@poocommerce/block-settings';
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
	showStepNumber: boolean;
	children: JSX.Element;
	className?: string;
} ) => {
	const { checkoutIsProcessing, prefersCollection } = useSelect(
		( select ) => {
			const checkoutStore = select( CHECKOUT_STORE_KEY );
			return {
				checkoutIsProcessing: checkoutStore.isProcessing(),
				prefersCollection: checkoutStore.prefersCollection(),
			};
		}
	);

	const { showFormStepNumbers } = useCheckoutBlockContext();

	if ( ! prefersCollection || ! LOCAL_PICKUP_ENABLED ) {
		return null;
	}

	return (
		<FormStep
			id="pickup-options"
			disabled={ checkoutIsProcessing }
			className={ clsx( 'wc-block-checkout__pickup-options', className ) }
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
