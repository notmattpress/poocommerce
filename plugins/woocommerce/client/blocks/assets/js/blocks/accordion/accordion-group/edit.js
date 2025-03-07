/**
 * External dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { PanelBody, ToggleControl } from '@wordpress/components';

const ACCORDION_BLOCK_NAME = 'poocommerce/accordion-item';
const ACCORDION_BLOCK = {
	name: ACCORDION_BLOCK_NAME,
};

export default function Edit( { attributes: { autoclose }, setAttributes } ) {
	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: [ [ ACCORDION_BLOCK_NAME ], [ ACCORDION_BLOCK_NAME ] ],
		defaultBlock: ACCORDION_BLOCK,
		directInsert: true,
	} );

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody
					title={ __( 'Settings', 'poocommerce' ) }
					initialOpen
				>
					<ToggleControl
						isBlock
						__nextHasNoMarginBottom
						label={ __( 'Auto-close', 'poocommerce' ) }
						onChange={ ( value ) => {
							setAttributes( {
								autoclose: value,
							} );
						} }
						checked={ autoclose }
						help={ __(
							'Automatically close accordions when a new one is opened.',
							'poocommerce'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
