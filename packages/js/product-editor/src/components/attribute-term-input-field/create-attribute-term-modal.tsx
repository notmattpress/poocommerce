/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	Modal,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { useState, createElement, Fragment } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { cleanForSlug } from '@wordpress/url';
import { Form, FormErrors } from '@poocommerce/components';
import { recordEvent } from '@poocommerce/tracks';
import {
	EXPERIMENTAL_PRODUCT_ATTRIBUTE_TERMS_STORE_NAME,
	ProductAttributeTerm,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { TRACKS_SOURCE } from '../../constants';

type CreateAttributeTermModalProps = {
	initialAttributeTermName: string;
	attributeId: number;
	onCancel?: () => void;
	onCreated?: ( newAttribute: ProductAttributeTerm ) => void;
};

export const CreateAttributeTermModal: React.FC<
	CreateAttributeTermModalProps
> = ( {
	initialAttributeTermName,
	attributeId,
	onCancel = () => {},
	onCreated = () => {},
} ) => {
	const { createNotice } = useDispatch( 'core/notices' );
	const [ isCreating, setIsCreating ] = useState( false );
	const { createProductAttributeTerm, invalidateResolutionForStoreSelector } =
		useDispatch( EXPERIMENTAL_PRODUCT_ATTRIBUTE_TERMS_STORE_NAME );

	const onAdd = async ( attribute: Partial< ProductAttributeTerm > ) => {
		recordEvent( 'product_attribute_term_add', {
			source: TRACKS_SOURCE,
		} );
		setIsCreating( true );
		try {
			const newAttribute: ProductAttributeTerm =
				await createProductAttributeTerm( {
					...attribute,
					attribute_id: attributeId,
				} );
			recordEvent( 'product_attribute_term_add_success', {
				source: TRACKS_SOURCE,
			} );
			invalidateResolutionForStoreSelector( 'getProductAttributes' );
			setIsCreating( false );
			onCreated( newAttribute );
		} catch ( e ) {
			recordEvent( 'product_attribute_term_add_failed', {
				source: TRACKS_SOURCE,
			} );
			createNotice(
				'error',
				__( 'Failed to create attribute term.', 'poocommerce' )
			);
			setIsCreating( false );
			onCancel();
		}
	};

	function validateForm(
		values: Partial< ProductAttributeTerm >
	): FormErrors< ProductAttributeTerm > {
		const errors: FormErrors< ProductAttributeTerm > = {};

		if ( ! values.name?.length ) {
			errors.name = __(
				'The attribute term name is required.',
				'poocommerce'
			);
		}

		return errors;
	}

	return (
		<Modal
			title={ __( 'Create attribute', 'poocommerce' ) }
			onRequestClose={ ( event ) => {
				event?.stopPropagation();
				onCancel();
			} }
			className="poocommerce-create-attribute-term-modal"
		>
			<Form<
				Pick< ProductAttributeTerm, 'name' | 'slug' | 'description' >
			>
				initialValues={ {
					name: initialAttributeTermName,
					slug: cleanForSlug( initialAttributeTermName ),
					description: '',
				} }
				validate={ validateForm }
				errors={ {} }
				onSubmit={ onAdd }
			>
				{ ( {
					getInputProps,
					handleSubmit,
					isValidForm,
					setValue,
					values,
				} ) => {
					const nameInputProps = getInputProps( 'name' );
					return (
						<>
							<TextControl
								label={ __( 'Name', 'poocommerce' ) }
								{ ...nameInputProps }
								onBlur={ () => {
									nameInputProps.onBlur();
									setValue(
										'slug',
										cleanForSlug( values.name )
									);
								} }
							/>
							<TextControl
								label={ __( 'Slug', 'poocommerce' ) }
								{ ...getInputProps( 'slug' ) }
								help={ __(
									'The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.',
									'poocommerce'
								) }
							/>
							<TextareaControl
								label={ __( 'Description', 'poocommerce' ) }
								{ ...getInputProps( 'description' ) }
							/>
							<div className="poocommerce-create-attribute-term-modal__buttons">
								<Button
									isSecondary
									label={ __( 'Cancel', 'poocommerce' ) }
									onClick={ () => onCancel() }
								>
									{ __( 'Cancel', 'poocommerce' ) }
								</Button>
								<Button
									isPrimary
									isBusy={ isCreating }
									label={ __(
										'Add attribute',
										'poocommerce'
									) }
									disabled={ ! isValidForm || isCreating }
									onClick={ handleSubmit }
								>
									{ __( 'Add', 'poocommerce' ) }
								</Button>
							</div>
						</>
					);
				} }
			</Form>
		</Modal>
	);
};
