/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Modal, TextControl } from '@wordpress/components';
import {
	useState,
	createElement,
	createInterpolateElement,
} from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { cleanForSlug } from '@wordpress/url';
import { Product } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { TRACKS_SOURCE } from '../../constants';

type EditProductLinkModalProps = {
	product: Product;
	permalinkPrefix: string;
	permalinkSuffix: string;
	onCancel: () => void;
	onSaved: () => void;
	saveHandler: (
		slug: string
	) => Promise< { slug: string; permalink: string } | undefined >;
};

export const EditProductLinkModal: React.FC< EditProductLinkModalProps > = ( {
	product,
	permalinkPrefix,
	permalinkSuffix,
	onCancel,
	onSaved,
	saveHandler,
} ) => {
	const { createNotice } = useDispatch( 'core/notices' );
	const [ isSaving, setIsSaving ] = useState< boolean >( false );
	const [ slug, setSlug ] = useState(
		product.slug || cleanForSlug( product.name )
	);

	const onSave = async () => {
		recordEvent( 'product_update_slug', {
			source: TRACKS_SOURCE,
			product_id: product.id,
			product_type: product.type,
		} );

		const { slug: updatedSlug, permalink: updatedPermalink } =
			( await saveHandler( slug ) ) ?? {};

		if ( updatedSlug ) {
			createNotice(
				updatedSlug === cleanForSlug( slug ) ? 'success' : 'info',
				updatedSlug === cleanForSlug( slug )
					? __( 'Product link successfully updated.', 'poocommerce' )
					: __(
							'Product link already existed, updated to ',
							'poocommerce'
					  ) + updatedPermalink
			);
		} else {
			createNotice(
				'error',
				__( 'Failed to update product link.', 'poocommerce' )
			);
		}
		onSaved();
	};

	const newProductLinkLabel =
		permalinkPrefix + cleanForSlug( slug ) + permalinkSuffix;

	return (
		<Modal
			title={ __( 'Edit product link', 'poocommerce' ) }
			onRequestClose={ () => onCancel() }
			className="poocommerce-product-link-edit-modal"
		>
			<div className="poocommerce-product-link-edit-modal__wrapper">
				<p className="poocommerce-product-link-edit-modal__description">
					{ __(
						"Create a unique link for this product. Use simple, descriptive words and numbers. We'll replace spaces with hyphens (-).",
						'poocommerce'
					) }
				</p>
				<TextControl
					label={ __( 'Product link', 'poocommerce' ) }
					name="slug"
					value={ slug }
					onChange={ setSlug }
					hideLabelFromVision
					help={ createInterpolateElement(
						__( 'Preview: <link />', 'poocommerce' ),
						{
							link: <strong>{ newProductLinkLabel }</strong>,
						}
					) }
				/>
				<div className="poocommerce-product-link-edit-modal__buttons">
					<Button isSecondary onClick={ () => onCancel() }>
						{ __( 'Cancel', 'poocommerce' ) }
					</Button>
					<Button
						isPrimary
						isBusy={ isSaving }
						disabled={ isSaving || slug === product.slug }
						onClick={ async () => {
							setIsSaving( true );
							await onSave();
							setIsSaving( false );
						} }
					>
						{ __( 'Save', 'poocommerce' ) }
					</Button>
				</div>
			</div>
		</Modal>
	);
};
