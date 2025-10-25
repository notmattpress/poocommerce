/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { EditProps } from './types';
import {
	DisplayStyleSwitcher,
	resetDisplayStyleBlock,
} from '../../components/display-style-switcher';
import metadata from './block.json';

export const TaxonomyFilterInspectorControls = ( {
	attributes,
	setAttributes,
	clientId,
}: EditProps ) => {
	const { showCounts, sortOrder, hideEmpty, displayStyle } = attributes;

	return (
		<InspectorControls>
			<ToolsPanel
				label={ __( 'Display Settings', 'poocommerce' ) }
				resetAll={ () => {
					setAttributes( {
						sortOrder: metadata.attributes.sortOrder.default,
						displayStyle: metadata.attributes.displayStyle.default,
						showCounts: metadata.attributes.showCounts.default,
						hideEmpty: metadata.attributes.hideEmpty.default,
					} );
					resetDisplayStyleBlock(
						clientId,
						metadata.attributes.displayStyle.default
					);
				} }
			>
				<ToolsPanelItem
					label={ __( 'Sort Order', 'poocommerce' ) }
					hasValue={ () => sortOrder !== 'count-desc' }
					onDeselect={ () =>
						setAttributes( {
							sortOrder: metadata.attributes.sortOrder.default,
						} )
					}
				>
					<SelectControl
						label={ __( 'Sort Order', 'poocommerce' ) }
						value={ sortOrder }
						options={ [
							{
								label: __(
									'Count (High to Low)',
									'poocommerce'
								),
								value: 'count-desc',
							},
							{
								label: __(
									'Count (Low to High)',
									'poocommerce'
								),
								value: 'count-asc',
							},
							{
								label: __( 'Name (A to Z)', 'poocommerce' ),
								value: 'name-asc',
							},
							{
								label: __( 'Name (Z to A)', 'poocommerce' ),
								value: 'name-desc',
							},
						] }
						onChange={ ( value: string ) =>
							setAttributes( { sortOrder: value } )
						}
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					label={ __( 'Display Style', 'poocommerce' ) }
					hasValue={ () =>
						displayStyle !==
						'poocommerce/product-filter-checkbox-list'
					}
					isShownByDefault={ true }
					onDeselect={ () => {
						setAttributes( {
							displayStyle:
								metadata.attributes.displayStyle.default,
						} );
						resetDisplayStyleBlock(
							clientId,
							metadata.attributes.displayStyle.default
						);
					} }
				>
					<DisplayStyleSwitcher
						clientId={ clientId }
						currentStyle={ displayStyle }
						onChange={ ( value ) =>
							setAttributes( { displayStyle: value } )
						}
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					label={ __( 'Product counts', 'poocommerce' ) }
					hasValue={ () => showCounts }
					onDeselect={ () =>
						setAttributes( {
							showCounts: metadata.attributes.showCounts.default,
						} )
					}
					isShownByDefault={ true }
				>
					<ToggleControl
						label={ __( 'Product counts', 'poocommerce' ) }
						checked={ showCounts }
						onChange={ ( value: boolean ) =>
							setAttributes( { showCounts: value } )
						}
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					label={ __( 'Hide items with no products', 'poocommerce' ) }
					hasValue={ () => ! hideEmpty }
					onDeselect={ () =>
						setAttributes( {
							hideEmpty: metadata.attributes.hideEmpty.default,
						} )
					}
				>
					<ToggleControl
						label={ __(
							'Hide items with no products',
							'poocommerce'
						) }
						checked={ hideEmpty }
						onChange={ ( value: boolean ) =>
							setAttributes( { hideEmpty: value } )
						}
					/>
				</ToolsPanelItem>
			</ToolsPanel>
		</InspectorControls>
	);
};
