/**
 * External dependencies
 */
import { useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import EditableButton from '@poocommerce/editor-components/editable-button';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import PageSelector from '@poocommerce/editor-components/page-selector';
import { CART_PAGE_ID } from '@poocommerce/block-settings';

/**
 * Internal dependencies
 */
import { defaultButtonLabel } from './constants';

export const Edit = ( {
	attributes,
	setAttributes,
}: {
	attributes: {
		checkoutPageId: number;
		className: string;
		buttonLabel: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ): JSX.Element => {
	const blockProps = useBlockProps();
	const { checkoutPageId = 0, buttonLabel } = attributes;
	const { current: savedCheckoutPageId } = useRef( checkoutPageId );

	const currentPostId = useSelect(
		( select ) => {
			if ( ! savedCheckoutPageId ) {
				const store = select( 'core/editor' );
				return store.getCurrentPostId();
			}
			return savedCheckoutPageId;
		},
		[ savedCheckoutPageId ]
	);

	return (
		<div { ...blockProps }>
			<InspectorControls>
				{ ! (
					currentPostId === CART_PAGE_ID && savedCheckoutPageId === 0
				) && (
					<PageSelector
						pageId={ checkoutPageId }
						setPageId={ ( id: number ) =>
							setAttributes( { checkoutPageId: id } )
						}
						labels={ {
							title: __(
								'Proceed to Checkout button',
								'poocommerce'
							),
							default: __(
								'PooCommerce Checkout Page',
								'poocommerce'
							),
						} }
					/>
				) }
			</InspectorControls>
			<EditableButton
				className="wc-block-cart__submit-button"
				value={ buttonLabel }
				placeholder={ defaultButtonLabel }
				onChange={ ( content ) => {
					setAttributes( {
						buttonLabel: content,
					} );
				} }
			/>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return <div { ...useBlockProps.save() } />;
};
