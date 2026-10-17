/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { Text } from '@poocommerce/experimental';

/**
 * Internal dependencies
 */
import './load-sample-product-confirm-modal.scss';

type Props = {
	onCancel: () => void;
	onImport: () => void;
};

export const LoadSampleProductConfirmModal: React.VFC< Props > = ( {
	onCancel,
	onImport,
} ) => {
	return (
		<Modal
			className="poocommerce-products-load-sample-product-confirm-modal"
			overlayClassName="poocommerce-products-load-sample-product-confirm-modal-overlay"
			title={ __( 'Load sample products', 'poocommerce' ) }
			onRequestClose={ onCancel }
		>
			<Text className="poocommerce-confirmation-modal__message">
				{ __(
					'We’ll import images from PooCommerce.com to set up your sample products.',
					'poocommerce'
				) }
			</Text>
			<div className="poocommerce-confirmation-modal-actions">
				<Button isSecondary onClick={ onCancel }>
					{ __( 'Cancel', 'poocommerce' ) }
				</Button>
				<Button isPrimary onClick={ onImport }>
					{ __( 'Import sample products', 'poocommerce' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default LoadSampleProductConfirmModal;
