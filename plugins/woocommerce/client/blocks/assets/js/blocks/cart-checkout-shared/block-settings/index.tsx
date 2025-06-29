/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockAttributes } from '@wordpress/blocks';

export const BlockSettings = ( {
	attributes,
	setAttributes,
}: {
	attributes: BlockAttributes;
	setAttributes: ( attrs: BlockAttributes ) => void;
} ) => {
	const { hasDarkControls, showFormStepNumbers } = attributes;
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Style', 'poocommerce' ) }>
				<ToggleControl
					label={ __( 'Show form step numbers', 'poocommerce' ) }
					checked={ showFormStepNumbers }
					onChange={ () =>
						setAttributes( {
							showFormStepNumbers: ! showFormStepNumbers,
						} )
					}
				/>
				<ToggleControl
					label={ __( 'Dark mode inputs', 'poocommerce' ) }
					help={ __(
						'Inputs styled specifically for use on dark background colors.',
						'poocommerce'
					) }
					checked={ hasDarkControls }
					onChange={ () =>
						setAttributes( {
							hasDarkControls: ! hasDarkControls,
						} )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export { ExpressPaymentControls } from './express-payment-settings';
