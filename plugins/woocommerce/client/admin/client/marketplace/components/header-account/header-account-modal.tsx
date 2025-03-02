/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import { Button, ButtonGroup, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

export interface HeaderAccountModalProps {
	setIsModalOpen: ( value: boolean ) => void;
	disconnectURL: string;
}

export default function HeaderAccountModal(
	props: HeaderAccountModalProps
): JSX.Element {
	const { setIsModalOpen, disconnectURL } = props;
	const [ isBusy, setIsBusy ] = useState( false );
	const toggleIsBusy = () => setIsBusy( ! isBusy );
	const closeModal = () => setIsModalOpen( false );

	return (
		<Modal
			title={ __(
				'Are you sure you want to disconnect?',
				'poocommerce'
			) }
			onRequestClose={ closeModal }
			focusOnMount={ true }
			className="poocommerce-marketplace__header-account-modal"
			style={ { borderRadius: 4 } }
			overlayClassName="poocommerce-marketplace__header-account-modal-overlay"
		>
			<p className="poocommerce-marketplace__header-account-modal-text">
				{ __(
					'Keep your store connected to PooCommerce.com to get updates, manage your subscriptions, and receive streamlined support for your extensions and themes.',
					'poocommerce'
				) }
			</p>
			<ButtonGroup className="poocommerce-marketplace__header-account-modal-button-group">
				<Button
					variant="tertiary"
					href={ disconnectURL }
					onClick={ toggleIsBusy }
					isBusy={ isBusy }
					isDestructive={ true }
					className="poocommerce-marketplace__header-account-modal-button"
				>
					{ __( 'Disconnect', 'poocommerce' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ closeModal }
					className="poocommerce-marketplace__header-account-modal-button"
				>
					{ __( 'Keep connected', 'poocommerce' ) }
				</Button>
			</ButtonGroup>
		</Modal>
	);
}
