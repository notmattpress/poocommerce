/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Modal, TextControl } from '@wordpress/components';
import { useState, createElement } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { recordEvent } from '@poocommerce/tracks';
import {
	EXPERIMENTAL_PRODUCT_TAGS_STORE_NAME,
	ProductTag,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { TRACKS_SOURCE } from '../../constants';
import { CreateTagModalProps } from './types';

export const CreateTagModal: React.FC< CreateTagModalProps > = ( {
	initialTagName,
	onCancel,
	onCreate,
} ) => {
	const { createNotice } = useDispatch( 'core/notices' );
	const [ isCreating, setIsCreating ] = useState( false );
	const { createProductTag, invalidateResolutionForStoreSelector } =
		useDispatch( EXPERIMENTAL_PRODUCT_TAGS_STORE_NAME );
	const [ tagName, setTagName ] = useState( initialTagName || '' );

	const onSave = async () => {
		recordEvent( 'product_tag_add', {
			source: TRACKS_SOURCE,
		} );
		setIsCreating( true );
		try {
			const newTag: ProductTag = await createProductTag( {
				name: tagName,
			} );
			invalidateResolutionForStoreSelector( 'getProductTags' );
			setIsCreating( false );
			onCreate( newTag );
		} catch ( e ) {
			createNotice(
				'error',
				__( 'Failed to create tag.', 'poocommerce' )
			);
			setIsCreating( false );
			onCancel();
		}
	};

	return (
		<Modal
			title={ __( 'Create tag', 'poocommerce' ) }
			onRequestClose={ () => onCancel() }
			className="poocommerce-create-new-tag-modal"
		>
			<div className="poocommerce-create-new-tag-modal__wrapper">
				<TextControl
					label={ __( 'Name', 'poocommerce' ) }
					name="Tops"
					value={ tagName }
					onChange={ setTagName }
				/>
				<div className="poocommerce-create-new-tag-modal__buttons">
					<Button
						isSecondary
						onClick={ () => onCancel() }
						disabled={ isCreating }
					>
						{ __( 'Cancel', 'poocommerce' ) }
					</Button>
					<Button
						isPrimary
						disabled={ tagName.length === 0 || isCreating }
						isBusy={ isCreating }
						onClick={ () => {
							onSave();
						} }
					>
						{ __( 'Save', 'poocommerce' ) }
					</Button>
				</div>
			</div>
		</Modal>
	);
};
