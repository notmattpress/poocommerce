/**
 * External dependencies
 */
import clsx from 'clsx';
import { withFilteredAttributes } from '@poocommerce/shared-hocs';
import { FormStep } from '@poocommerce/blocks-components';
import { useDispatch, useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
import { useShippingData } from '@poocommerce/base-context/hooks';
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
	showPrice,
	showIcon,
	shippingText,
	localPickupText,
}: {
	title: string;
	description: string;
	children: JSX.Element;
	className?: string;
	showPrice: boolean;
	showIcon: boolean;
	shippingText: string;
	localPickupText: string;
} ) => {
	const { showFormStepNumbers } = useCheckoutBlockContext();
	const { checkoutIsProcessing, prefersCollection } = useSelect(
		( select ) => {
			const checkoutStore = select( CHECKOUT_STORE_KEY );
			return {
				checkoutIsProcessing: checkoutStore.isProcessing(),
				prefersCollection: checkoutStore.prefersCollection(),
			};
		}
	);
	const { setPrefersCollection } = useDispatch( CHECKOUT_STORE_KEY );
	const {
		shippingRates,
		needsShipping,
		hasCalculatedShipping,
		isCollectable,
	} = useShippingData();

	if (
		! needsShipping ||
		! hasCalculatedShipping ||
		! shippingRates ||
		! isCollectable ||
		! LOCAL_PICKUP_ENABLED
	) {
		return null;
	}

	const onChange = ( method: string ) => {
		if ( method === 'pickup' ) {
			setPrefersCollection( true );
		} else {
			setPrefersCollection( false );
		}
	};

	return (
		<FormStep
			id="shipping-method"
			disabled={ checkoutIsProcessing }
			className={ clsx(
				'wc-block-checkout__shipping-method',
				className
			) }
			title={ title }
			description={ description }
			showStepNumber={ showFormStepNumbers }
		>
			<Block
				checked={ prefersCollection ? 'pickup' : 'shipping' }
				onChange={ onChange }
				showPrice={ showPrice }
				showIcon={ showIcon }
				localPickupText={ localPickupText }
				shippingText={ shippingText }
			/>
			{ children }
		</FormStep>
	);
};

export default withFilteredAttributes( attributes )( FrontendBlock );
