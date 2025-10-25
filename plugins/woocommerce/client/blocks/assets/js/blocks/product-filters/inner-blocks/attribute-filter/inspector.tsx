/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Block, getBlockTypes } from '@wordpress/blocks';
import {
	SelectControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { sortOrderOptions, sortOrders } from './constants';
import { EditProps, DEFAULT_SORT_ORDER, DEFAULT_QUERY_TYPE } from './types';
import metadata from './block.json';
import {
	DisplayStyleSwitcher,
	resetDisplayStyleBlock,
} from '../../components/display-style-switcher';

let displayStyleOptions: Block[] = [];

export const Inspector = ( {
	clientId,
	attributes,
	setAttributes,
}: EditProps ) => {
	const { sortOrder, queryType, displayStyle, showCounts, hideEmpty } =
		attributes;

	if ( displayStyleOptions.length === 0 ) {
		displayStyleOptions = getBlockTypes().filter( ( blockType ) =>
			blockType.ancestor?.includes(
				'poocommerce/product-filter-attribute'
			)
		);
	}

	return (
		<>
			<InspectorControls key="inspector">
				<ToolsPanel
					label={ __( 'Display Settings', 'poocommerce' ) }
					resetAll={ () => {
						setAttributes( {
							sortOrder: DEFAULT_SORT_ORDER,
							queryType: DEFAULT_QUERY_TYPE,
							displayStyle:
								metadata.attributes.displayStyle.default,
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
						hasValue={ () => sortOrder !== DEFAULT_SORT_ORDER }
						onDeselect={ () =>
							setAttributes( {
								sortOrder: DEFAULT_SORT_ORDER,
							} )
						}
					>
						<SelectControl
							label={ __( 'Sort order', 'poocommerce' ) }
							value={ sortOrder }
							options={ [
								{
									value: '',
									label: __(
										'Select an option',
										'poocommerce'
									),
									disabled: true,
								},
								...sortOrderOptions,
							] }
							onChange={ ( value ) => {
								if (
									value &&
									Object.keys( sortOrders ).includes( value )
								) {
									setAttributes( {
										sortOrder:
											value as keyof typeof sortOrders,
									} );
								}
							} }
							help={ __(
								'Determine the order of filter options.',
								'poocommerce'
							) }
							__nextHasNoMarginBottom
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={ __( 'Logic', 'poocommerce' ) }
						hasValue={ () => queryType !== DEFAULT_QUERY_TYPE }
						onDeselect={ () =>
							setAttributes( {
								queryType: DEFAULT_QUERY_TYPE,
							} )
						}
					>
						<ToggleGroupControl
							label={ __( 'Logic', 'poocommerce' ) }
							isBlock
							value={ queryType }
							onChange={ ( value ) => {
								if ( value === 'and' || value === 'or' ) {
									setAttributes( { queryType: value } );
								}
							} }
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							style={ { width: '100%' } }
							help={
								queryType === 'and'
									? createInterpolateElement(
											__(
												'Display products that match <b>all</b> selected attributes (they need to include <b>all of them</b>).',
												'poocommerce'
											),
											{
												b: <strong />,
											}
									  )
									: __(
											"Display products that match any of the selected attributes (they don't need to match all).",
											'poocommerce'
									  )
							}
						>
							<ToggleGroupControlOption
								label={ __( 'Any', 'poocommerce' ) }
								value="or"
							/>
							<ToggleGroupControlOption
								label={ __( 'All', 'poocommerce' ) }
								value="and"
							/>
						</ToggleGroupControl>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={ __( 'Display Style', 'poocommerce' ) }
						hasValue={ () =>
							displayStyle !==
							metadata.attributes.displayStyle.default
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
						hasValue={ () =>
							showCounts !==
							metadata.attributes.showCounts.default
						}
						onDeselect={ () =>
							setAttributes( {
								showCounts:
									metadata.attributes.showCounts.default,
							} )
						}
						isShownByDefault={ true }
					>
						<ToggleControl
							label={ __( 'Product counts', 'poocommerce' ) }
							checked={ showCounts }
							onChange={ ( value ) =>
								setAttributes( { showCounts: value } )
							}
							__nextHasNoMarginBottom
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={ __(
							'Hide items with no products',
							'poocommerce'
						) }
						hasValue={ () =>
							hideEmpty !== metadata.attributes.hideEmpty.default
						}
						onDeselect={ () =>
							setAttributes( {
								hideEmpty:
									metadata.attributes.hideEmpty.default,
							} )
						}
					>
						<ToggleControl
							label={ __(
								'Hide items with no products',
								'poocommerce'
							) }
							checked={ hideEmpty }
							onChange={ ( value ) =>
								setAttributes( { hideEmpty: value } )
							}
							__nextHasNoMarginBottom
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>
		</>
	);
};
