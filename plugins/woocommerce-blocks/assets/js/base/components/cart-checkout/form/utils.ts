/**
 * External dependencies
 */
import { DocumentObject } from '@poocommerce/base-hooks';
import {
	AddressForm,
	AddressFormValues,
	Field,
	KeyedFormFields,
} from '@poocommerce/settings';
import { isObject, objectHasProp } from '@poocommerce/types';
import { JSONSchemaType } from 'ajv';

export interface FieldProps {
	id: string;
	errorId: string;
	label: string;
	autoCapitalize: string | undefined;
	autoComplete: string | undefined;
	errorMessage: string | undefined;
	required: boolean | undefined;
	placeholder: string | undefined;
	className: string;
}

export const createFieldProps = (
	field: KeyedFormFields[ number ],
	formId: string,
	fieldAddressType: string
): FieldProps => ( {
	id: `${ formId }-${ field?.key }`.replaceAll( '/', '-' ), // Replace all slashes with hyphens to avoid invalid HTML ID.
	errorId: `${ fieldAddressType }_${ field?.key }`,
	label: ( field?.required ? field?.label : field?.optionalLabel ) || '',
	autoCapitalize: field?.autocapitalize,
	autoComplete: field?.autocomplete,
	errorMessage: field?.errorMessage,
	required: field?.required,
	placeholder: field?.placeholder,
	className: `wc-block-components-address-form__${ field?.key }`.replaceAll(
		'/',
		'-'
	), // Replace all slashes with hyphens to avoid invalid HTML classes.,
	...field?.attributes,
} );

export const createCheckboxFieldProps = ( fieldProps: FieldProps ) => {
	const {
		errorId,
		errorMessage,
		autoCapitalize,
		autoComplete,
		placeholder,
		...rest
	} = fieldProps;
	return rest;
};
export const getFieldData = < T extends keyof AddressForm >(
	key: T,
	fields: KeyedFormFields,
	values: AddressFormValues
): {
	field: AddressForm[ typeof key ] & {
		key: typeof key;
		errorMessage?: string;
	};
	value: string;
} | null => {
	const addressField = fields.find( ( _field ) => _field.key === key );
	const addressValue = objectHasProp( values, key ) ? values[ key ] : '';
	if ( ! addressField ) {
		return null;
	}

	return {
		field: { ...addressField, key }, // TS won't infer the key type correctly.
		value: addressValue,
	};
};

export const hasSchemaRules = (
	field: Field,
	key: keyof Field[ 'rules' ]
): field is Field & {
	rules: {
		[ k in typeof key ]: JSONSchemaType< DocumentObject< 'global' > >;
	};
} => {
	return (
		isObject( field.rules ) &&
		isObject( field.rules[ key ] ) &&
		Object.keys( field.rules[ key ] ).length > 0
	);
};
