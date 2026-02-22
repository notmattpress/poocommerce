/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { displayShortcut } from '@wordpress/keycodes';
import { PreferenceToggleMenuItem } from '@wordpress/preferences';

/**
 * Internal dependencies
 */
import { ViewMoreMenuGroup } from '../../private-apis';
import { storeName } from '../../store';

export const MoreMenu = () => {
	const isLargeViewport = useViewportMatch( 'large' );

	return (
		<>
			{ isLargeViewport && (
				<ViewMoreMenuGroup>
					<PreferenceToggleMenuItem
						scope={ storeName }
						name="fullscreenMode"
						label={ __( 'Fullscreen mode', 'poocommerce' ) }
						info={ __(
							'Show and hide the admin user interface',
							'poocommerce'
						) }
						messageActivated={ __(
							'Fullscreen mode activated.',
							'poocommerce'
						) }
						messageDeactivated={ __(
							'Fullscreen mode deactivated.',
							'poocommerce'
						) }
						shortcut={ displayShortcut.secondary( 'f' ) }
					/>
				</ViewMoreMenuGroup>
			) }
		</>
	);
};
