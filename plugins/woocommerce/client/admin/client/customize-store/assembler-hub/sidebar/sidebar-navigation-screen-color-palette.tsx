/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
// @ts-ignore No types for this exist yet.
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
// @ts-ignore No types for this exist yet.
import { unlock } from '@wordpress/edit-site/build-module/lock-unlock';

/**
 * Internal dependencies
 */
import { SidebarNavigationScreen } from './sidebar-navigation-screen';
import { ColorPalette, ColorPanel } from './global-styles';
import { trackEvent } from '~/customize-store/tracking';

const { GlobalStylesContext } = unlock( blockEditorPrivateApis );

const SidebarNavigationScreenColorPaletteContent = () => {
	// @ts-ignore No types for this exist yet.
	const { user } = useContext( GlobalStylesContext );
	const hasCreatedOwnColors = !! (
		user.settings.color && user.settings.color.palette.hasCreatedOwnColors
	);

	function handlePanelBodyToggle( open?: boolean ) {
		trackEvent(
			'customize_your_store_assembler_hub_color_palette_create_toggle',
			{ open }
		);
	}

	// Wrap in a BlockEditorProvider to ensure that the Iframe's dependencies are
	// loaded. This is necessary because the Iframe component waits until
	// the block editor store's `__internalIsInitialized` is true before
	// rendering the iframe. Without this, the iframe previews will not render
	// in mobile viewport sizes, where the editor canvas is hidden.
	return (
		<div
			className="poocommerce-customize-store_sidebar-color-content"
			style={ {
				opacity: 0,
				animation: 'containerFadeIn 300ms ease-in-out forwards',
			} }
		>
			<ColorPalette />
			<PanelBody
				className="poocommerce-customize-store__color-panel-container"
				title={ __( 'or create your own', 'poocommerce' ) }
				initialOpen={ hasCreatedOwnColors }
				onToggle={ handlePanelBodyToggle }
			>
				<ColorPanel />
			</PanelBody>
		</div>
	);
};

export const SidebarNavigationScreenColorPalette = ( {
	onNavigateBackClick,
}: {
	onNavigateBackClick: () => void;
} ) => {
	const title = __( 'Choose your color palette', 'poocommerce' );
	const description = __(
		'Choose the color palette that best suits your brand. Want to change it? Create your custom color palette below, or update it later in Editor.',
		'poocommerce'
	);

	return (
		<SidebarNavigationScreen
			title={ title }
			onNavigateBackClick={ onNavigateBackClick }
			description={ description }
			content={ <SidebarNavigationScreenColorPaletteContent /> }
		/>
	);
};
