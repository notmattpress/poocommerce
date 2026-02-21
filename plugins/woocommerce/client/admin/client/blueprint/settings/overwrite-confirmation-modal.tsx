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

export const OverwriteConfirmationModal = ( {
	isOpen,
	isImporting,
	onClose,
	onConfirm,
	overwrittenItems,
}: OverwriteConfirmationModalProps ) => {
	if ( ! isOpen ) return null;
	return (
		<Modal
			title={ __(
				'Your configuration will be overridden',
				'poocommerce'
			) }
			onRequestClose={ onClose }
			className="poocommerce-blueprint-overwrite-modal"
			isDismissible={ ! isImporting }
		>
			<p className="poocommerce-blueprint-overwrite-modal__description">
				{ overwrittenItems.length
					? __(
							'Importing the file will overwrite the current configuration for the following items in PooCommerce Settings:',
							'poocommerce'
					  )
					: __(
							'Importing the file will overwrite the current configuration in PooCommerce Settings.',
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
					disabled={ isImporting }
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
