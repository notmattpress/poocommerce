/**
 * External dependencies
 */
import { Modal, Button, Notice, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

type OverwriteConfirmationModalProps = {
	isOpen: boolean;
	isImporting: boolean;
	onClose: () => void;
	onConfirm: () => void;
	overwrittenItems: string[];
	additionalActions?: string[];
};

export const OverwriteConfirmationModal = ( {
	isOpen,
	isImporting,
	onClose,
	onConfirm,
	overwrittenItems,
	additionalActions = [],
}: OverwriteConfirmationModalProps ) => {
	if ( ! isOpen ) {
		return null;
	}
	return (
		<Modal
			title={ __( 'Review what this Blueprint will do', 'poocommerce' ) }
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

			{ !! additionalActions.length && (
				<>
					<p className="poocommerce-blueprint-overwrite-modal__description poocommerce-blueprint-overwrite-modal__description--actions">
						{ __( 'It will also:', 'poocommerce' ) }
					</p>
					<ul className="poocommerce-blueprint-overwrite-modal__list">
						{ additionalActions.map( ( action ) => (
							<li key={ action }>{ action }</li>
						) ) }
					</ul>
				</>
			) }

			<Notice
				status="warning"
				isDismissible={ false }
				className="poocommerce-blueprint-overwrite-modal__trust-notice"
			>
				{ __(
					'A Blueprint runs with your administrator access, so it can change anything on your site — including data that is not listed above. Only import files from a source you trust.',
					'poocommerce'
				) }
			</Notice>

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
