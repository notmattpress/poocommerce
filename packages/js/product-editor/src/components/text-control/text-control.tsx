/**
 * External dependencies
 */
import { Ref } from 'react';
import { createElement, forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import { __experimentalInputControl as InputControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Label } from '../label/label';
import { TextControlProps } from './types';

export const TextControl = forwardRef( function ForwardedTextControl(
	{
		label,
		help,
		error,
		tooltip,
		className,
		required,
		onChange,
		onBlur,
		...props
	}: TextControlProps,
	ref: Ref< HTMLInputElement >
) {
	return (
		<InputControl
			{ ...props }
			ref={ ref }
			className={ clsx( 'poocommerce-product-text-control', className, {
				'has-error': error,
			} ) }
			label={
				<Label
					label={ label }
					required={ required }
					tooltip={ tooltip }
				/>
			}
			required={ required }
			help={ error || help }
			onChange={ ( value: string | undefined ) => {
				onChange( value ?? '' );
			} }
			onBlur={ onBlur }
		/>
	);
} );
