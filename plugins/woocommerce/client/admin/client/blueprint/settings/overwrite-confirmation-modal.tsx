/**
 * External dependencies
 */
import { Modal, Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

type OverwriteConfirmationModalProps = {
	isOpen: boolean;
	isImporting: boolean;
	onClose: () => void;
	onConfirm: () => void;
	overwrittenItems: string[];
};

export const OverwriteConfirmationModal: React.FC<
	OverwriteConfirmationModalProps
> = ( { isOpen, isImporting, onClose, onConfirm, overwrittenItems } ) => {
	if ( ! isOpen ) return null;
	return (
		<Modal
			title={ __(
				'Your configuration will be overridden',
				'poocommerce'
			) }
			onRequestClose={ onClose }
			className="poocommerce-blueprint-overwrite-modal"
		>
			<p className="poocommerce-blueprint-overwrite-modal__description">
				{ __(
					'Importing the file will overwrite the current configuration for the following items in PooCommerce Settings:',
					'poocommerce'
				) }
			</p>

			<ul className="poocommerce-blueprint-overwrite-modal__list">
				{ overwrittenItems.map( ( item ) => (
					<li key={ item }>{ item }</li>
				) ) }
			</ul>

			<div className="poocommerce-blueprint-overwrite-modal__actions">
				<Button
					className="poocommerce-blueprint-overwrite-modal__actions-cancel"
					variant="tertiary"
					onClick={ onClose }
				>
					{ __( 'Cancel', 'poocommerce' ) }
				</Button>
				<Button
					className={ clsx(
						'poocommerce-blueprint-overwrite-modal__actions-import',
						{
							'is-importing': isImporting,
						}
					) }
					variant="primary"
					onClick={ onConfirm }
				>
					{ isImporting ? (
						<Spinner />
					) : (
						__( 'Import', 'poocommerce' )
					) }
				</Button>
			</div>
		</Modal>
	);
};
