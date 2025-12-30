// This file acts as a way of adding JS integration support for the email editor package

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { initializeEditor } from '@poocommerce/email-editor';

/**
 * Internal dependencies
 */
import { NAME_SPACE } from './constants';
import { modifyTemplateSidebar } from './templates';
import { modifySidebar } from './sidebar_settings';
import { registerEmailValidationRules } from './email-validation';

import './style.scss';

addFilter( 'poocommerce_email_editor_send_button_label', NAME_SPACE, () =>
	__( 'Save email', 'poocommerce' )
);

addFilter(
	'poocommerce_email_editor_check_sending_method_configuration_link',
	NAME_SPACE,
	() => 'https://poocommerce.com/document/email-faq/'
);

// Add filter to permanently delete emails.
// This is used to delete email posts from the database instead of moving them to the trash.
// The email posts can be recreated from the PooCommerce settings email listing page.
addFilter(
	'poocommerce_email_editor_trash_modal_should_permanently_delete',
	NAME_SPACE,
	() => true
);

/**
 * Register default handler for creating coupons in PooCommerce.
 * Uses the localized admin URL from PHP to support subdirectory installations.
 * Integrators can override this filter to customize behavior (e.g., SPA routing).
 */
addFilter( 'poocommerce_email_editor_create_coupon_handler', NAME_SPACE, () => {
	// Get the create coupon URL from localized data (provided by PHP)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const editorStore = ( window as any ).wp?.data?.select(
		'poocommerce/email-editor'
	);
	const urls = editorStore?.getUrls?.();
	const createCouponUrl = urls?.createCoupon;

	// Return the handler function
	return () => {
		if ( createCouponUrl ) {
			// Use the localized URL from PHP (supports subdirectory installations)
			window.open( createCouponUrl, '_blank' );
		} else {
			// Fallback: relative path (may not work in subdirectory installations)
			window.open(
				'/wp-admin/post-new.php?post_type=shop_coupon',
				'_blank'
			);
		}
	};
} );

modifySidebar();
modifyTemplateSidebar();
registerEmailValidationRules();
initializeEditor( 'poocommerce-email-editor' );
