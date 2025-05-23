/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { BaseProductFieldProps } from '../types';

type TextFieldProps = BaseProductFieldProps< string >;

const TextField = ( { label, value, onChange }: TextFieldProps ) => {
	return (
		<TextControl label={ label } onChange={ onChange } value={ value } />
	);
};

export default TextField;
