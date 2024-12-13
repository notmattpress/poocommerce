/**
 * External dependencies
 */
import interpolateComponents from '@automattic/interpolate-components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface EmailSentProps {
	returnToSendLinkPage: () => void;
}

export const EmailSentPage: React.FC< EmailSentProps > = ( {
	returnToSendLinkPage: returnToSendLinkPage,
} ) => {
	return (
		<div className="email-sent-modal-body">
			<div className="email-sent-illustration"></div>
			<div className="email-sent-title">
				<h1>{ __( 'Check your email!', 'poocommerce' ) }</h1>
			</div>
			<div className="email-sent-subheader-spacer">
				<div className="email-sent-subheader">
					{ __(
						'We just sent you the magic link. Open it on your mobile device and follow the instructions.',
						'poocommerce'
					) }
				</div>
			</div>
			<div className="email-sent-footer">
				<div className="email-sent-footer-prompt">
					{ __( 'DIDN’T GET IT?', 'poocommerce' ) }
				</div>
				<div className="email-sent-footer-text">
					{ interpolateComponents( {
						mixedString: __(
							'Check your spam/junk email folder or {{ sendAnotherLink /}}.',
							'poocommerce'
						),
						components: {
							sendAnotherLink: (
								<Button
									className="email-sent-send-another-link"
									onClick={ () => {
										returnToSendLinkPage();
									} }
								>
									{ __( 'send another link', 'poocommerce' ) }
								</Button>
							),
						},
					} ) }
				</div>
			</div>
		</div>
	);
};
