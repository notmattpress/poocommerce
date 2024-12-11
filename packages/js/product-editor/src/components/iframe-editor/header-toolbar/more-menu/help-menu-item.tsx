/**
 * External dependencies
 */
import { MenuItem, VisuallyHidden } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { external } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { recordEvent } from '@poocommerce/tracks';

export const HelpMenuItem = () => {
	const recordClick = () => {
		recordEvent( 'product_iframe_editor_help_menu_item_click' );
	};

	return (
		<MenuItem
			role="menuitem"
			icon={ external }
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore href is okay here
			href={ __(
				'https://wordpress.org/documentation/article/wordpress-block-editor/',
				'poocommerce'
			) }
			onClick={ recordClick }
			target="_blank"
			rel="noopener noreferrer"
		>
			{ __( 'Help', 'poocommerce' ) }
			<VisuallyHidden as="span">
				{
					/* translators: accessibility text */
					__( '(opens in a new tab)', 'poocommerce' )
				}
			</VisuallyHidden>
		</MenuItem>
	);
};
