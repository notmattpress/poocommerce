/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import EditableButton from '@poocommerce/editor-components/editable-button';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { defaultCheckoutButtonLabel } from './constants';
import { getVariant } from '../utils';

export const Edit = ( {
	attributes,
	setAttributes,
}: {
	attributes: {
		checkoutButtonLabel: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ): JSX.Element => {
	const blockProps = useBlockProps( {
		className: clsx( 'wc-block-mini-cart__footer-checkout' ),
	} );
	const { checkoutButtonLabel } = attributes;

	return (
		<div { ...blockProps }>
			<EditableButton
				variant={ getVariant( blockProps.className, 'contained' ) }
				value={ checkoutButtonLabel }
				placeholder={ defaultCheckoutButtonLabel }
				onChange={ ( content ) => {
					setAttributes( {
						checkoutButtonLabel: content,
					} );
				} }
				style={ blockProps.style }
			/>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return <div { ...useBlockProps.save() }></div>;
};
