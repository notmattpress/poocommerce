/**
 * External dependencies
 */
import { createElement, MouseEvent, useRef, forwardRef } from 'react';
import clsx from 'clsx';
import { Icon, chevronDown } from '@wordpress/icons';

type ComboBoxProps = {
	children?: React.ReactNode | null;
	comboBoxProps: JSX.IntrinsicElements[ 'div' ];
	inputProps: JSX.IntrinsicElements[ 'input' ];
	getToggleButtonProps?: () => Omit<
		JSX.IntrinsicElements[ 'button' ],
		'ref'
	>;
	suffix?: JSX.Element | null;
	showToggleButton?: boolean;
};

const ToggleButton = forwardRef< HTMLButtonElement >( ( props, ref ) => {
	// using forwardRef here because getToggleButtonProps injects a ref prop
	return (
		<button
			className="poocommerce-experimental-select-control__combox-box-toggle-button"
			{ ...props }
			ref={ ref }
		>
			<Icon icon={ chevronDown } />
		</button>
	);
} );

export const ComboBox = ( {
	children,
	comboBoxProps,
	getToggleButtonProps = () => ( {} ),
	inputProps,
	suffix,
	showToggleButton,
}: ComboBoxProps ) => {
	const inputRef = useRef< HTMLInputElement | null >( null );

	const maybeFocusInput = ( event: MouseEvent< HTMLDivElement > ) => {
		if ( ! inputRef || ! inputRef.current ) {
			return;
		}

		if ( document.activeElement !== inputRef.current ) {
			event.preventDefault();
			inputRef.current.focus();
			event.stopPropagation();
		}
	};

	return (
		// Disable reason: The click event is purely for accidental clicks around the input.
		// Keyboard users are still able to tab to and interact with elements in the combobox.
		/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
		<div
			className={ clsx(
				'poocommerce-experimental-select-control__combo-box-wrapper',
				{
					'poocommerce-experimental-select-control__combo-box-wrapper--disabled':
						inputProps.disabled,
				}
			) }
			onMouseDown={ maybeFocusInput }
		>
			<div className="poocommerce-experimental-select-control__items-wrapper">
				{ children }
				<div
					{ ...comboBoxProps }
					className="poocommerce-experimental-select-control__combox-box"
				>
					<input
						{ ...inputProps }
						ref={ ( node ) => {
							inputRef.current = node;
							if ( typeof inputProps.ref === 'function' ) {
								(
									inputProps.ref as unknown as (
										node: HTMLInputElement | null
									) => void
								 )( node );
							}
						} }
					/>
				</div>
			</div>
			{ suffix && (
				<div className="poocommerce-experimental-select-control__suffix">
					{ suffix }
				</div>
			) }
			{ showToggleButton && (
				<ToggleButton { ...getToggleButtonProps() } />
			) }
		</div>
	);
};
