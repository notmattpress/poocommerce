/**
 * External dependencies
 */
import { FormEvent } from 'react';
import { Button, Modal } from '@wordpress/components';
import { createElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { dragHandle } from '@wordpress/icons';
import { Product } from '@poocommerce/data';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { ReorderProductsModalProps } from './types';
import { useDraggable } from '../../hooks/use-draggable';
import { getProductImageStyle } from './add-products-modal';

export function ReorderProductsModal( {
	products,
	onSubmit,
	onClose,
}: ReorderProductsModalProps ) {
	const [ selectedProducts, setSelectedProducts ] = useState< Product[] >( [
		...products,
	] );

	function handleSubmit( event: FormEvent< HTMLFormElement > ) {
		event.preventDefault();

		onSubmit( [ ...selectedProducts ] );
	}

	function handleCancelClick() {
		onClose();
	}

	const { container, draggable, handler } = useDraggable( {
		onSort: setSelectedProducts,
	} );

	return (
		<Modal
			title={ __( 'Reorder products in this group', 'poocommerce' ) }
			className="poocommerce-reorder-products-modal"
			onRequestClose={ onClose }
		>
			<form
				noValidate
				onSubmit={ handleSubmit }
				className="poocommerce-add-products-modal__form"
			>
				<fieldset className="poocommerce-add-products-modal__form-group">
					<legend className="poocommerce-add-products-modal__form-group-title">
						{ __(
							'Click and drag to reorder on the product page.',
							'poocommerce'
						) }
					</legend>

					{ Boolean( selectedProducts.length ) && (
						<ul
							{ ...container }
							className={ classNames(
								'poocommerce-add-products-modal__list',
								container.className
							) }
						>
							{ selectedProducts.map( ( item ) => (
								<li
									{ ...draggable }
									key={ item.id }
									className="poocommerce-add-products-modal__list-item"
								>
									<Button
										{ ...handler }
										icon={ dragHandle }
										variant="tertiary"
										type="button"
										aria-label={ __(
											'Sortable handler',
											'poocommerce'
										) }
									/>
									<div
										className="poocommerce-add-products-modal__list-item-image"
										style={ getProductImageStyle( item ) }
									/>
									<div className="poocommerce-add-products-modal__list-item-content">
										<div className="poocommerce-add-products-modal__list-item-title">
											{ item.name }
										</div>

										<div className="poocommerce-add-products-modal__list-item-description">
											{ item.sku }
										</div>
									</div>
								</li>
							) ) }
						</ul>
					) }
				</fieldset>

				<div className="poocommerce-add-products-modal__actions">
					<Button
						variant="tertiary"
						type="button"
						onClick={ handleCancelClick }
					>
						{ __( 'Cancel', 'poocommerce' ) }
					</Button>
					<Button variant="primary" type="submit">
						{ __( 'Done', 'poocommerce' ) }
					</Button>
				</div>
			</form>
		</Modal>
	);
}
