/**
 * External dependencies
 */
import { Button, ButtonGroup, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import sanitizeHTML from '../../../lib/sanitize-html';
import { Subscription } from '../my-subscriptions/types';
import {
	WOO_CONNECT_PLUGIN_DOWNLOAD_URL,
	WP_ADMIN_PLUGIN_LIST_URL,
} from '../constants';
import { getAdminSetting } from '../../../utils/admin-settings';

interface ConnectProps {
	subscription: Subscription;
	onClose: () => void;
}

export default function InstallWooConnectModal( props: ConnectProps ) {
	const wccomSettings = getAdminSetting( 'wccomHelper', {} );
	if ( ! wccomSettings?.wooUpdateManagerInstalled ) {
		return (
			<Modal
				title={ __( 'Access your updates', 'poocommerce' ) }
				onRequestClose={ props.onClose }
				focusOnMount={ true }
				className="poocommerce-marketplace__header-account-modal"
				style={ { borderRadius: 4 } }
				overlayClassName="poocommerce-marketplace__header-account-modal-overlay"
			>
				<p className="poocommerce-marketplace__header-account-modal-text">
					<span
						dangerouslySetInnerHTML={ sanitizeHTML(
							sprintf(
								// translators: %s is the product version number (e.g. 1.0.2).
								__(
									'Version %s is available. To access this update, please first <b>install the PooCommerce.com Update Manager</b> extension. Alternatively, you can download and install it manually.',
									'poocommerce'
								),
								props.subscription.version
							)
						) }
					/>
				</p>
				<ButtonGroup className="poocommerce-marketplace__header-account-modal-button-group">
					<Button
						href={ WOO_CONNECT_PLUGIN_DOWNLOAD_URL }
						variant="secondary"
					>
						{ __( 'Download', 'poocommerce' ) }
					</Button>
					<Button
						href={ wccomSettings?.wooUpdateManagerInstallUrl }
						variant="primary"
					>
						{ __( 'Install', 'poocommerce' ) }
					</Button>
				</ButtonGroup>
			</Modal>
		);
	}

	if ( ! wccomSettings?.wooUpdateManagerActive ) {
		return (
			<Modal
				title={ __( 'Access your updates', 'poocommerce' ) }
				onRequestClose={ props.onClose }
				focusOnMount={ true }
				className="poocommerce-marketplace__header-account-modal"
				style={ { borderRadius: 4 } }
				overlayClassName="poocommerce-marketplace__header-account-modal-overlay"
			>
				<p className="poocommerce-marketplace__header-account-modal-text">
					<span
						dangerouslySetInnerHTML={ sanitizeHTML(
							sprintf(
								// translators: %s is the product version number (e.g. 1.0.2).
								__(
									'Version %s is available. To access this update, please <b>activate the PooCommerce.com Update Manager</b> extension.',
									'poocommerce'
								),
								props.subscription.version
							)
						) }
					/>
				</p>
				<ButtonGroup className="poocommerce-marketplace__header-account-modal-button-group">
					<Button onClick={ props.onClose } variant="link">
						{ __( 'Cancel', 'poocommerce' ) }
					</Button>
					<Button href={ WP_ADMIN_PLUGIN_LIST_URL } variant="primary">
						{ __( 'Activate', 'poocommerce' ) }
					</Button>
				</ButtonGroup>
			</Modal>
		);
	}

	return null;
}
