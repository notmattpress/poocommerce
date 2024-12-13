/**
 * External dependencies
 */
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { FormStep } from '@poocommerce/blocks-components';
import { useShippingData } from '@poocommerce/base-context/hooks';
import { useDispatch, useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';

/**
 * Internal dependencies
 */
import CheckoutOrderNotes from '../../order-notes';

const Block = ( { className }: { className?: string } ): JSX.Element => {
	const { needsShipping } = useShippingData();
	const { isProcessing: checkoutIsProcessing, orderNotes } = useSelect(
		( select ) => {
			const store = select( CHECKOUT_STORE_KEY );
			return {
				isProcessing: store.isProcessing(),
				orderNotes: store.getOrderNotes(),
			};
		}
	);
	const { __internalSetOrderNotes } = useDispatch( CHECKOUT_STORE_KEY );

	return (
		<FormStep
			id="order-notes"
			showStepNumber={ false }
			className={ clsx( 'wc-block-checkout__order-notes', className ) }
			disabled={ checkoutIsProcessing }
		>
			<CheckoutOrderNotes
				disabled={ checkoutIsProcessing }
				onChange={ __internalSetOrderNotes }
				placeholder={
					needsShipping
						? __(
								'Notes about your order, e.g. special notes for delivery.',
								'poocommerce'
						  )
						: __( 'Notes about your order.', 'poocommerce' )
				}
				value={ orderNotes }
			/>
		</FormStep>
	);
};

export default Block;
