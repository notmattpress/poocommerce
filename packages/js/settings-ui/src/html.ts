/**
 * External dependencies
 */
import { sanitizeHTML } from '@poocommerce/sanitize';

export const sanitizeSettingsHtml = ( html?: string ) => sanitizeHTML( html );
