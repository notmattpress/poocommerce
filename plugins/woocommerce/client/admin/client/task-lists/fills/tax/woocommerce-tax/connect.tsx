/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { recordEvent, queueRecordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { default as ConnectForm } from '~/dashboard/components/connect';
import { SetupStepProps } from './setup';

export const Connect = ( { onDisable, onManual }: SetupStepProps ) => {
	return (
		// @ts-expect-error Todo: convert ConnectForm to TypeScript
		<ConnectForm
			onConnect={ () => {
				recordEvent( 'tasklist_tax_connect_store', {
					connect: true,
					no_tax: false,
				} );
			} }
			onSkip={ () => {
				queueRecordEvent( 'tasklist_tax_connect_store', {
					connect: false,
					no_tax: false,
				} );
				onManual();
			} }
			skipText={ __( 'Set up tax rates manually', 'poocommerce' ) }
			onAbort={ () => onDisable() }
			abortText={ __(
				"My business doesn't charge sales tax",
				'poocommerce'
			) }
		/>
	);
};
