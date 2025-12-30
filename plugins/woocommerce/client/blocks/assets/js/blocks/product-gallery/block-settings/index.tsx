/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { ProductGallerySettingsProps } from '../types';

export const ProductGalleryBlockSettings = ( {
	attributes,
	setAttributes,
}: ProductGallerySettingsProps ) => {
	const { hoverZoom, fullScreenOnClick } = attributes;
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Media Settings', 'poocommerce' ) }>
				<ToggleControl
					label={ __( 'Zoom while hovering', 'poocommerce' ) }
					help={ __(
						'While hovering the image in the viewer will zoom in by 30%.',
						'poocommerce'
					) }
					checked={ hoverZoom }
					onChange={ () =>
						setAttributes( {
							hoverZoom: ! hoverZoom,
						} )
					}
				/>
				<ToggleControl
					label={ __( 'Open pop-up when clicked', 'poocommerce' ) }
					help={ __(
						'Clicking on the image in the viewer will open a full-screen gallery experience.',
						'poocommerce'
					) }
					checked={ fullScreenOnClick }
					onChange={ () =>
						setAttributes( {
							fullScreenOnClick: ! fullScreenOnClick,
						} )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
};
