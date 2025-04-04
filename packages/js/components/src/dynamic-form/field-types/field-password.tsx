/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { TextField } from './field-text';
import { ControlProps } from '../types';

export const PasswordField = ( props: ControlProps ) => {
	return <TextField { ...props } type="password" />;
};
