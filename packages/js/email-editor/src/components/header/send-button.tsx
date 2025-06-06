/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import {
	// @ts-expect-error No types available for useEntitiesSavedStatesIsDirty
	useEntitiesSavedStatesIsDirty,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { storeName } from '../../store';
import { recordEvent } from '../../events';

export function SendButton() {
	const { isDirty } = useEntitiesSavedStatesIsDirty();

	const { hasEmptyContent, isEmailSent, urls } = useSelect(
		( select ) => ( {
			hasEmptyContent: select( storeName ).hasEmptyContent(),
			isEmailSent: select( storeName ).isEmailSent(),
			urls: select( storeName ).getUrls(),
		} ),
		[]
	);

	function sendAction() {
		if ( urls.send ) {
			window.location.href = urls.send;
		}
	}

	const isDisabled = hasEmptyContent || isEmailSent || isDirty;

	const label = applyFilters(
		'poocommerce_email_editor_send_button_label',
		__( 'Send', 'poocommerce' )
	) as string;

	return (
		<Button
			variant="primary"
			size="compact"
			onClick={ () => {
				recordEvent( 'header_send_button_clicked' );
				const action = applyFilters(
					'poocommerce_email_editor_send_action_callback',
					sendAction
				) as () => void;
				action();
			} }
			disabled={ isDisabled }
			data-automation-id="email_editor_send_button"
		>
			{ label }
		</Button>
	);
}
