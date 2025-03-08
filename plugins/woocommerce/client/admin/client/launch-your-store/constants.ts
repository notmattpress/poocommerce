/**
 * External dependencies
 */
import { getAdminLink } from '@poocommerce/settings';

export const COMING_SOON_PAGE_EDITOR_LINK = getAdminLink(
	'site-editor.php?postType=wp_template&postId=poocommerce/poocommerce//coming-soon&canvas=edit'
);

export const SITE_VISIBILITY_DOC_LINK =
	'https://poocommerce.com/document/configuring-poocommerce-settings/coming-soon-mode/';

export const LAUNCH_YOUR_STORE_DOC_LINK =
	'https://poocommerce.com/document/configuring-poocommerce-settings/#site-visibility';
