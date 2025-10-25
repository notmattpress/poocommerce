/**
 * External dependencies
 */
import { SelectControl } from '@wordpress/components';
import { createElement, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { DataFormControlProps } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import type { DataFormItem } from '../types';

type SelectProps = DataFormControlProps< DataFormItem > & {
	help?: React.ReactNode;
};

export const Select = ( {
	field,
	onChange,
	data,
	help,
	hideLabelFromVision,
}: SelectProps ) => {
	const { id } = field;

	// DataForm will automatically use the id as the label if no label is provided so we conditionally set the label to undefined if it matches the id to avoid displaying it.
	// We should contribute upstream to allow label to be optional.
	const label = field.label === id ? undefined : field.label;

	const value = field.getValue( { item: data } ) ?? '';
	const onChangeControl = useCallback(
		( newValue: string ) =>
			onChange( {
				[ id ]: newValue,
			} ),
		[ id, onChange ]
	);

	const elements = [
		/*
		 * Value can be undefined when:
		 *
		 * - the field is not required
		 * - in bulk editing
		 *
		 */
		{ label: __( 'Select item', 'poocommerce' ), value: '' },
		...( field?.elements ?? [] ),
	];

	return (
		<SelectControl
			id={ id }
			label={ label }
			value={ value }
			help={ help }
			options={ elements }
			onChange={ onChangeControl }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			hideLabelFromVision={ hideLabelFromVision }
		/>
	);
};
