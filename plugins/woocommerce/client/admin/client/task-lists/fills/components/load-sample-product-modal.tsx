/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Modal, Spinner } from '@wordpress/components';
import { Text } from '@poocommerce/experimental';

/**
 * Internal dependencies
 */
import './load-sample-product-modal.scss';

const LoadSampleProductModal: React.FC = () => {
	return (
		<Modal
			className="poocommerce-products-load-sample-product-modal"
			overlayClassName="poocommerce-products-load-sample-product-modal-overlay"
			title=""
			onRequestClose={ () => {} }
		>
			<Spinner color="#007cba" size={ 48 } />
			<Text className="poocommerce-load-sample-product-modal__title">
				{ __( 'Loading sample products', 'poocommerce' ) }
			</Text>
			<Text className="poocommerce-load-sample-product-modal__description">
				{ __(
					'We are loading 9 sample products into your store',
					'poocommerce'
				) }
			</Text>
		</Modal>
	);
};

export default LoadSampleProductModal;
