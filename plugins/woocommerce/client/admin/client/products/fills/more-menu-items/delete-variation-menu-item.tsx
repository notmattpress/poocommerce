/**
 * External dependencies
 */
import { useParams } from 'react-router-dom';
import { MenuGroup, MenuItem } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { EXPERIMENTAL_PRODUCT_VARIATIONS_STORE_NAME } from '@poocommerce/data';
import { getNewPath, navigateTo } from '@poocommerce/navigation';
import {
	RemoveConfirmationModal,
	__experimentalUseVariationSwitcher as useVariationSwitcher,
} from '@poocommerce/product-editor';
import { recordEvent } from '@poocommerce/tracks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet.
// eslint-disable-next-line @poocommerce/dependency-group
import { useEntityId, useEntityProp } from '@wordpress/core-data';

export type DeleteVariationMenuItemProps = { onClose(): void };

export const DeleteVariationMenuItem = ( {
	onClose,
}: DeleteVariationMenuItemProps ) => {
	const [ showModal, setShowModal ] = useState( false );

	const { productId } = useParams();

	const variationId = useEntityId( 'postType', 'product_variation' );

	const {
		invalidateVariationList,
		goToNextVariation,
		goToPreviousVariation,
		numberOfVariations,
	} = useVariationSwitcher( {
		parentId: productId ? parseInt( productId, 10 ) : undefined,
		variationId,
	} );

	const [ name ] = useEntityProp( 'postType', 'product_variation', 'name' );

	const [ status ] = useEntityProp(
		'postType',
		'product_variation',
		'status'
	);

	const { deleteProductVariation } = useDispatch(
		EXPERIMENTAL_PRODUCT_VARIATIONS_STORE_NAME
	);

	const { createSuccessNotice, createErrorNotice } =
		useDispatch( 'core/notices' );

	function handleMenuItemClick() {
		recordEvent( 'product_dropdown_option_click', {
			selected_option: 'delete_variation',
			product_id: productId,
			variation_id: variationId,
			product_status: status,
		} );

		setShowModal( true );
	}

	async function handleRemove() {
		recordEvent( 'product_delete_variation_modal', {
			action: 'delete',
			product_id: productId,
			variation_id: variationId,
			product_status: status,
		} );

		return deleteProductVariation( {
			product_id: productId,
			id: variationId,
		} )
			.then( () => {
				createSuccessNotice(
					sprintf(
						// translators: %s is the variation name.
						__( '%s deleted.', 'poocommerce' ),
						name
					)
				);
				setShowModal( false );
				onClose();

				invalidateVariationList();
				if ( numberOfVariations && numberOfVariations > 1 ) {
					if ( ! goToNextVariation() ) {
						// This would only happen when deleting the last variation.
						goToPreviousVariation();
					}
				} else {
					navigateTo( {
						url: getNewPath( {}, `/product/${ productId }` ),
					} );
				}
			} )
			.catch( () => {
				createErrorNotice(
					__( 'Failed to delete the variation.', 'poocommerce' )
				);
			} );
	}

	function handleClose() {
		recordEvent( 'product_delete_variation_modal', {
			action: 'close',
			product_id: productId,
			variation_id: variationId,
			product_status: status,
		} );

		setShowModal( false );
	}

	return (
		<>
			<MenuGroup>
				<MenuItem isDestructive onClick={ handleMenuItemClick }>
					{ __( 'Delete variation', 'poocommerce' ) }
				</MenuItem>
			</MenuGroup>

			{ showModal && (
				<RemoveConfirmationModal
					title={ sprintf(
						// translators: %s is the variation name.
						__( 'Delete %s?', 'poocommerce' ),
						name
					) }
					description={
						<>
							<p>
								{ __(
									'If you continue, this variation with all of its information will be deleted and customers will no longer be able to purchase it.',
									'poocommerce'
								) }
							</p>

							<strong>
								{ __(
									'Deleted variations cannot be restored.',
									'poocommerce'
								) }
							</strong>
						</>
					}
					onRemove={ handleRemove }
					onCancel={ handleClose }
				/>
			) }
		</>
	);
};
