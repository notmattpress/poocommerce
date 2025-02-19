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
	const { cropImages, hoverZoom, fullScreenOnClick } = attributes;
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Media Settings', 'poocommerce' ) }>
				<ToggleControl
					label={ __( 'Crop images to fit', 'poocommerce' ) }
					help={ __(
						'Images will be cropped to fit within a square space.',
						'poocommerce'
					) }
					checked={ cropImages }
					onChange={ () =>
						setAttributes( {
							cropImages: ! cropImages,
						} )
					}
					className="wc-block-product-gallery__crop-images"
				/>
				<ToggleControl
					label={ __( 'Zoom while hovering', 'poocommerce' ) }
					help={ __(
						'While hovering the large image will zoom in by 30%.',
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
						'Clicking on the large image will open a full-screen gallery experience.',
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
