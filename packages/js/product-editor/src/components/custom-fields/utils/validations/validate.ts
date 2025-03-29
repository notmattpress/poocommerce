/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { Metadata } from '../../../../types';
import type { ValidationError } from './types';

export function validate(
	customField: Partial< Metadata< string > >,
	customFields: Metadata< string >[]
): ValidationError {
	const errors = {} as ValidationError;

	if ( ! customField.key ) {
		errors.key = __( 'The name is required.', 'poocommerce' );
	} else if ( customField.key.startsWith( '_' ) ) {
		errors.key = __(
			'The name cannot begin with the underscore (_) character.',
			'poocommerce'
		);
	} else if (
		customFields.some(
			( field ) =>
				field.id !== customField.id && field.key === customField.key
		)
	) {
		errors.key = __( 'The name must be unique.', 'poocommerce' );
	}

	if ( ! customField.value ) {
		errors.value = __( 'The value is required.', 'poocommerce' );
	}

	return errors;
}
