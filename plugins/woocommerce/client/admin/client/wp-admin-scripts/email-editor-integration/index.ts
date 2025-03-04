// This file acts as a way of adding JS integration support for the email editor package

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

const NAME_SPACE = 'poocommerce/email-editor-integration';

addFilter(
	'mailpoet_email_editor_send_button_label',
	NAME_SPACE,
	() => 'Save PooCommerce email template' // This is a temporary label to confirm the integration works, it will be updated in the future.
);
