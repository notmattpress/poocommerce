/**
 * External dependencies
 */
import clsx from 'clsx';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { Main } from '@poocommerce/base-components/sidebar-layout';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import type { TemplateArray } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { useCheckoutBlockContext } from '../../context';
import {
	useForcedLayout,
	getAllowedBlocks,
} from '../../../cart-checkout-shared';
import './style.scss';
import { AddressFieldControls } from '../../address-field-controls';
export const Edit = ( {
	clientId,
	attributes,
}: {
	clientId: string;
	attributes: {
		className?: string;
		isPreview?: boolean;
	};
} ): JSX.Element => {
	const blockProps = useBlockProps( {
		className: clsx( 'wc-block-checkout__main', attributes?.className ),
	} );
	const allowedBlocks = getAllowedBlocks( innerBlockAreas.CHECKOUT_FIELDS );

	const { showFormStepNumbers } = useCheckoutBlockContext();

	const defaultTemplate = [
		[ 'poocommerce/checkout-express-payment-block', {}, [] ],
		[ 'poocommerce/checkout-contact-information-block', {}, [] ],
		[ 'poocommerce/checkout-shipping-method-block', {}, [] ],
		[ 'poocommerce/checkout-pickup-options-block', {}, [] ],
		[ 'poocommerce/checkout-shipping-address-block', {}, [] ],
		[ 'poocommerce/checkout-billing-address-block', {}, [] ],
		[ 'poocommerce/checkout-shipping-methods-block', {}, [] ],
		[ 'poocommerce/checkout-payment-block', {}, [] ],
		[ 'poocommerce/checkout-additional-information-block', {}, [] ],
		[ 'poocommerce/checkout-order-note-block', {}, [] ],
		[ 'poocommerce/checkout-terms-block', {}, [] ],
		[ 'poocommerce/checkout-actions-block', {}, [] ],
	].filter( Boolean ) as unknown as TemplateArray;

	useForcedLayout( {
		clientId,
		registeredBlocks: allowedBlocks,
		defaultTemplate,
	} );

	return (
		<Main { ...blockProps }>
			<AddressFieldControls />
			<form
				className={ clsx(
					'wc-block-components-form wc-block-checkout__form',
					{
						'wc-block-checkout__form--with-step-numbers':
							showFormStepNumbers,
					}
				) }
			>
				<InnerBlocks
					allowedBlocks={ allowedBlocks }
					templateLock={ false }
					template={ defaultTemplate }
					renderAppender={ InnerBlocks.ButtonBlockAppender }
				/>
			</form>
		</Main>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</div>
	);
};
