/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export const wooContentBlock = {
	title: __( 'Woo Email Content', 'poocommerce' ),
	category: 'text',
	attributes: {},
	edit: () => (
		<p>
			<strong>This will be replaced by PooCommerce Content</strong>
		</p>
	),
	save: () => <div>##WOO_CONTENT##</div>,
};
