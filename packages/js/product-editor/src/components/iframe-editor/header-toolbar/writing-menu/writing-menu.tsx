/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';
import { MenuGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { createElement } from '@wordpress/element';
import {
	PreferenceToggleMenuItem,
	store as preferencesStore,
	// @ts-expect-error missing types.
} from '@wordpress/preferences';

export function WritingMenu() {
	const { set: setPreference } = useDispatch( preferencesStore );

	const turnOffDistractionFree = () => {
		setPreference( 'core', 'distractionFree', false );
	};

	const isLargeViewport = useViewportMatch( 'medium' );
	if ( ! isLargeViewport ) {
		return null;
	}

	return (
		<MenuGroup label={ __( 'View', 'poocommerce' ) }>
			<PreferenceToggleMenuItem
				scope="core"
				name="fixedToolbar"
				onToggle={ turnOffDistractionFree }
				label={ __( 'Top toolbar', 'poocommerce' ) }
				info={ __(
					'Access all block and document tools in a single place',
					'poocommerce'
				) }
				messageActivated={ __(
					'Top toolbar activated',
					'poocommerce'
				) }
				messageDeactivated={ __(
					'Top toolbar deactivated',
					'poocommerce'
				) }
			/>
		</MenuGroup>
	);
}
