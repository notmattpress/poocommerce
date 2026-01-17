/**
 * External dependencies
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	Disabled,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

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
				<ToolsPanel
					label={ __( 'Accessibility', 'poocommerce' ) }
					resetAll={ () => {
						setAttributes( { useLabel: false } );
					} }
				>
					<ToolsPanelItem
						hasValue={ () => useLabel !== false }
						label={ __( 'Show visual label', 'poocommerce' ) }
						onDeselect={ () =>
							setAttributes( { useLabel: false } )
						}
						isShownByDefault
					>
						<ToggleControl
							__nextHasNoMarginBottom
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
					</ToolsPanelItem>
				</ToolsPanel>
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
