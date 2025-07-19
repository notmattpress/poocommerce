/**
 * External dependencies
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Disabled, PanelBody, ToggleControl } from '@wordpress/components';
import type { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { BlockAttributes } from './types';

const CatalogSorting = ( {
	useLabel,
}: Pick< BlockAttributes, 'useLabel' > ) => {
	return (
		<>
			{ useLabel ? (
				<>
					<label
						className="orderby-label"
						htmlFor="poocommerce-orderby"
					>
						{ __( 'Sort by', 'poocommerce' ) }
					</label>
					<select className="orderby" id="poocommerce-orderby">
						<option>{ __( 'Default', 'poocommerce' ) }</option>
					</select>
				</>
			) : (
				<select className="orderby">
					<option>{ __( 'Default sorting', 'poocommerce' ) }</option>
				</select>
			) }
		</>
	);
};

const Edit = ( {
	attributes,
	setAttributes,
}: BlockEditProps< BlockAttributes > ) => {
	const { useLabel } = attributes;
	const blockProps = useBlockProps( {
		className: 'poocommerce wc-block-catalog-sorting',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Accessibility', 'poocommerce' ) }>
					<ToggleControl
						label={ __( 'Show visual label', 'poocommerce' ) }
						help={ __(
							'Displays "Sort by" text before the dropdown menu to improve clarity and accessibility.',
							'poocommerce'
						) }
						checked={ useLabel }
						onChange={ ( isChecked ) =>
							setAttributes( {
								useLabel: isChecked,
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<Disabled>
					<CatalogSorting useLabel={ useLabel } />
				</Disabled>
			</div>
		</>
	);
};

export default Edit;
