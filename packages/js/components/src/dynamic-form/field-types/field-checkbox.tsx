/**
 * External dependencies
 */
import { CheckboxControl } from '@wordpress/components';
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ControlProps } from '../types';

export const CheckboxField = ( {
	field,
	onChange,
	...props
}: ControlProps ) => {
	const { label, description } = field;

	return (
		<CheckboxControl
			onChange={ ( val ) => onChange( val ) }
			title={ description }
			label={ label }
			{ ...props }
		/>
	);
};
