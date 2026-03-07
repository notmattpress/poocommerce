/**
 * External dependencies
 */
import { MenuItem } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { media } from '@wordpress/icons';
import { MediaUpload } from '@wordpress/media-utils';

/**
 * Internal dependencies
 */
import type { MediaLibraryMenuItemProps } from './types';

export function MediaLibraryMenuItem( {
	icon,
	iconPosition,
	text,
	info,
	...props
}: MediaLibraryMenuItemProps ) {
	return (
		<MediaUpload
			{ ...props }
			render={ ( { open } ) => (
				<MenuItem
					icon={ icon ?? media }
					iconPosition={ iconPosition ?? 'left' }
					onClick={ open }
					info={
						info ??
						__( 'Choose from uploaded media', 'poocommerce' )
					}
				>
					{ text ?? __( 'Media Library', 'poocommerce' ) }
				</MenuItem>
			) }
		/>
	);
}
