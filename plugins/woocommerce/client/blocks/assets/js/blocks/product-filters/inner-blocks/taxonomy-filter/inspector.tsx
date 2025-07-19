/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { getSetting } from '@poocommerce/settings';
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
import type { EditProps, TaxonomyItem } from './types';
import {
	DisplayStyleSwitcher,
	resetDisplayStyleBlock,
} from '../../components/display-style-switcher';
import metadata from './block.json';
import { updateFilterHeading } from '../../utils/update-filter-heading';
import { getTaxonomyLabel } from './utils';

const taxonomies = getSetting< TaxonomyItem[] >(
	'filterableProductTaxonomies',
	[]
);
const taxonomyOptions = taxonomies.map( ( item ) => ( {
	label: item.label,
	value: item.name,
} ) );

export const TaxonomyFilterInspectorControls = ( {
	attributes,
	setAttributes,
	clientId,
}: EditProps ) => {
	const { taxonomy, showCounts, sortOrder, hideEmpty, displayStyle } =
		attributes;

	return (
		<InspectorControls>
			<ToolsPanel
				label={ __( 'Taxonomy Filter Settings', 'poocommerce' ) }
				resetAll={ () => {
					setAttributes( {
						taxonomy: metadata.attributes.taxonomy.default,
						sortOrder: metadata.attributes.sortOrder.default,
						displayStyle: metadata.attributes.displayStyle.default,
						showCounts: metadata.attributes.showCounts.default,
						hideEmpty: metadata.attributes.hideEmpty.default,
					} );
					resetDisplayStyleBlock(
						clientId,
						metadata.attributes.displayStyle.default,
						metadata.name
					);
				} }
			>
				<ToolsPanelItem
					label={ __( 'Taxonomy', 'poocommerce' ) }
					hasValue={ () => !! taxonomy }
					onDeselect={ () =>
						setAttributes( {
							taxonomy: metadata.attributes.taxonomy.default,
						} )
					}
					isShownByDefault={ true }
				>
					<SelectControl
						label={ __( 'Taxonomy', 'poocommerce' ) }
						help={ __(
							'Select a taxonomy to filter by.',
							'poocommerce'
						) }
						value={ taxonomy }
						options={ [
							{
								label: __( 'Select a taxonomy', 'poocommerce' ),
								value: '',
							},
							...taxonomyOptions,
						] }
						onChange={ ( value: string ) => {
							setAttributes( { taxonomy: value } );
							updateFilterHeading(
								clientId,
								getTaxonomyLabel( value )
							);
						} }
					/>
				</ToolsPanelItem>
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
							metadata.attributes.displayStyle.default,
							metadata.name
						);
					} }
				>
					<DisplayStyleSwitcher
						clientId={ clientId }
						currentStyle={ displayStyle }
						onChange={ ( value: string | number | undefined ) =>
							setAttributes( { displayStyle: value as string } )
						}
						parentBlockName={ metadata.name }
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
