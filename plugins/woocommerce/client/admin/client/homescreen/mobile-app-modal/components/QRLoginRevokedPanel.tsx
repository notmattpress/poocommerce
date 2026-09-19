/**
 * External dependencies
 */
import React from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

type QRLoginRevokedPanelProps = {
	onDone?: () => void;
};

/**
 * Final confirmation panel shown after the merchant clicks "It wasn't you?"
 * and the Application Password has been deleted server-side. The mobile app's
 * next request will fail with 401 and the device will be effectively signed
 * out the moment it tries to do anything.
 */
export const QRLoginRevokedPanel = ( { onDone }: QRLoginRevokedPanelProps ) => {
	return (
		<div
			className="poocommerce-qr-direct-login poocommerce-qr-direct-login--revoked"
			role="status"
			aria-live="polite"
		>
			<p className="poocommerce-qr-direct-login__revoked-headline">
				{ __( 'Access revoked', 'poocommerce' ) }
			</p>
			<p className="poocommerce-qr-direct-login__revoked-subline">
				{ __(
					'The mobile app will be signed out the next time it makes a request.',
					'poocommerce'
				) }
			</p>

			{ onDone && (
				<Button variant="primary" onClick={ onDone }>
					{ __( 'Done', 'poocommerce' ) }
				</Button>
			) }
		</div>
	);
};
