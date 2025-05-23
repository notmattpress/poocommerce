/**
 * External dependencies
 */
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { EmailTypes } from './settings-email-preview-slotfill';

type EmailPreviewTypeProps = {
	emailTypes: EmailTypes;
	emailType: string;
	setEmailType: ( emailType: string ) => void;
};

export const EmailPreviewType = ( {
	emailTypes,
	emailType,
	setEmailType,
}: EmailPreviewTypeProps ) => {
	return (
		<div className="wc-settings-email-preview-type wc-settings-prevent-change-event">
			<SelectControl
				onChange={ setEmailType }
				options={ emailTypes }
				value={ emailType }
				aria-label={ __( 'Email preview type', 'poocommerce' ) }
			></SelectControl>
		</div>
	);
};
