/**
 * External dependencies
 */
import { getSetting } from '@poocommerce/settings';
import { AttributeSetting } from '@poocommerce/types';
import { InspectorControls } from '@wordpress/block-editor';
import { dispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Block, getBlockTypes, createBlock } from '@wordpress/blocks';
import {
	ComboboxControl,
	PanelBody,
	SelectControl,
	ToggleControl,
	// @ts-expect-error - no types.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// @ts-expect-error - no types.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { sortOrderOptions } from './constants';
import { BlockAttributes, EditProps } from './types';
import { getAttributeFromId } from './utils';
import { getInnerBlockByName } from '../../utils';

const ATTRIBUTES = getSetting< AttributeSetting[] >( 'attributes', [] );

let displayStyleOptions: Block[] = [];

export const Inspector = ( {
	clientId,
	attributes,
	setAttributes,
}: EditProps ) => {
	const {
		attributeId,
		sortOrder,
		queryType,
		displayStyle,
		showCounts,
		hideEmpty,
	} = attributes;
	const { updateBlockAttributes, insertBlock, replaceBlock } =
		dispatch( 'core/block-editor' );
	const filterBlock = useSelect(
		( select ) => {
			return select( 'core/block-editor' ).getBlock( clientId );
		},
		[ clientId ]
	);
	const [ displayStyleBlocksAttributes, setDisplayStyleBlocksAttributes ] =
		useState< Record< string, unknown > >( {} );

	const filterHeadingBlock = getInnerBlockByName(
		filterBlock,
		'core/heading'
	);

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
				<PanelBody title={ __( 'Attribute', 'poocommerce' ) }>
					<ComboboxControl
						__nextHasNoMarginBottom
						options={ ATTRIBUTES.map( ( item ) => ( {
							value: item.attribute_id,
							label: item.attribute_label,
						} ) ) }
						value={ attributeId + '' }
						onChange={ ( value ) => {
							const numericId = parseInt( value || '', 10 );
							setAttributes( {
								attributeId: numericId,
							} );
							const attributeObject =
								getAttributeFromId( numericId );
							if ( filterHeadingBlock ) {
								updateBlockAttributes(
									filterHeadingBlock.clientId,
									{
										content:
											attributeObject?.label ??
											__( 'Attribute', 'poocommerce' ),
									}
								);
							}
						} }
						help={ __(
							'Choose the attribute to show in this filter.',
							'poocommerce'
						) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Settings', 'poocommerce' ) }>
					<SelectControl
						label={ __( 'Sort order', 'poocommerce' ) }
						value={ sortOrder }
						options={ [
							{
								value: '',
								label: __( 'Select an option', 'poocommerce' ),
								disabled: true,
							},
							...sortOrderOptions,
						] }
						onChange={ ( value ) =>
							setAttributes( { sortOrder: value } )
						}
						help={ __(
							'Determine the order of filter options.',
							'poocommerce'
						) }
						__nextHasNoMarginBottom
					/>
					<ToggleGroupControl
						label={ __( 'Logic', 'poocommerce' ) }
						isBlock
						value={ queryType }
						onChange={ ( value: BlockAttributes[ 'queryType' ] ) =>
							setAttributes( { queryType: value } )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						style={ { width: '100%' } }
						help={
							queryType === 'and'
								? createInterpolateElement(
										__(
											'Show results for <b>all</b> selected attributes. Displayed products must contain <b>all of them</b> to appear in the results.',
											'poocommerce'
										),
										{
											b: <strong />,
										}
								  )
								: __(
										'Show results for any of the attributes selected (displayed products don’t have to have them all).',
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
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={ __( 'Display', 'poocommerce' ) }>
					<ToggleGroupControl
						value={ displayStyle }
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						onChange={ (
							value: BlockAttributes[ 'displayStyle' ]
						) => {
							if ( ! filterBlock ) return;
							const currentStyleBlock = getInnerBlockByName(
								filterBlock,
								displayStyle
							);

							if ( currentStyleBlock ) {
								setDisplayStyleBlocksAttributes( {
									...displayStyleBlocksAttributes,
									[ displayStyle ]:
										currentStyleBlock.attributes,
								} );
								replaceBlock(
									currentStyleBlock.clientId,
									createBlock(
										value,
										displayStyleBlocksAttributes[ value ] ||
											{}
									)
								);
							} else {
								insertBlock(
									createBlock( value ),
									filterBlock.innerBlocks.length,
									filterBlock.clientId,
									false
								);
							}
							setAttributes( { displayStyle: value } );
						} }
						style={ { width: '100%' } }
					>
						{ displayStyleOptions.map( ( blockType ) => (
							<ToggleGroupControlOption
								key={ blockType.name }
								label={ blockType.title }
								value={ blockType.name }
							/>
						) ) }
					</ToggleGroupControl>
					<ToggleControl
						label={ __( 'Product counts', 'poocommerce' ) }
						checked={ showCounts }
						onChange={ ( value ) =>
							setAttributes( { showCounts: value } )
						}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Empty filter options', 'poocommerce' ) }
						checked={ ! hideEmpty }
						onChange={ ( value ) =>
							setAttributes( { hideEmpty: ! value } )
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
};
