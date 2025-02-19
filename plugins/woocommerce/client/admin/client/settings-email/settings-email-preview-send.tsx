/**
 * External dependencies
 */
import { Button, Modal, TextControl } from '@wordpress/components';
import { Icon, check, warning } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isValidEmail } from '@poocommerce/product-editor';

/**
 * Internal dependencies
 */
import { emailPreviewNonce } from './settings-email-preview-nonce';

type EmailPreviewSendProps = {
	type: string;
};

type EmailPreviewSendResponse = {
	message: string;
};

type WPError = {
	message: string;
	code: string;
	data: {
		status: number;
	};
};

export const EmailPreviewSend: React.FC< EmailPreviewSendProps > = ( {
	type,
} ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ email, setEmail ] = useState( '' );
	const [ isSending, setIsSending ] = useState( false );
	const [ notice, setNotice ] = useState( '' );
	const [ noticeType, setNoticeType ] = useState( '' );
	const nonce = emailPreviewNonce();

	const handleSendEmail = async () => {
		setIsSending( true );
		setNotice( '' );
		try {
			const response: EmailPreviewSendResponse = await apiFetch( {
				path: `wc-admin-email/settings/email/send-preview?nonce=${ nonce }`,
				method: 'POST',
				data: { email, type },
			} );
			setNotice( response.message );
			setNoticeType( 'success' );
		} catch ( e ) {
			const wpError = e as WPError;
			setNotice( wpError.message );
			setNoticeType( 'error' );
		}
		setIsSending( false );
	};

	return (
		<div className="wc-settings-email-preview-send">
			<Button
				variant="secondary"
				onClick={ () => setIsModalOpen( true ) }
			>
				{ __( 'Send a test email', 'poocommerce' ) }
			</Button>

			{ isModalOpen && (
				<Modal
					title={ __( 'Send a test email', 'poocommerce' ) }
					onRequestClose={ () => {
						setIsModalOpen( false );
						setIsSending( false );
					} }
					className="wc-settings-email-preview-send-modal"
				>
					<p>
						{ __(
							'Send yourself a test email to check how your email looks in different email apps.',
							'poocommerce'
						) }
					</p>

					<TextControl
						label={ __( 'Send to', 'poocommerce' ) }
						type="email"
						value={ email }
						placeholder={ __( 'Enter an email', 'poocommerce' ) }
						onChange={ setEmail }
					/>
					{ notice && (
						<div
							className={ `wc-settings-email-preview-send-modal-notice wc-settings-email-preview-send-modal-notice-${ noticeType }` }
						>
							<Icon
								icon={
									noticeType === 'success' ? check : warning
								}
							/>
							<span>{ notice }</span>
						</div>
					) }

					<div className="wc-settings-email-preview-send-modal-buttons">
						<Button
							variant="tertiary"
							onClick={ () => setIsModalOpen( false ) }
						>
							{ __( 'Cancel', 'poocommerce' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ handleSendEmail }
							isBusy={ isSending }
							disabled={ ! isValidEmail( email ) || isSending }
						>
							{ isSending
								? __( 'Sending…', 'poocommerce' )
								: __( 'Send test email', 'poocommerce' ) }
						</Button>
					</div>
				</Modal>
			) }
		</div>
	);
};
