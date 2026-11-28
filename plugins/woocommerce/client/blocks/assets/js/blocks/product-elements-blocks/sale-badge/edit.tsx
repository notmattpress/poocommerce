/**
 * External dependencies
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';
import type { ReactElement } from 'react';
import { ProductQueryContext as Context } from '@poocommerce/blocks/product-query/types';

/**
 * Internal dependencies
 */
import Block from './block';
import type { BlockAttributes } from './types';
import { useIsDescendentOfSingleProductTemplate } from '../shared/use-is-descendent-of-single-product-template';

const Edit = ( {
	attributes,
	setAttributes,
	context,
}: BlockEditProps< BlockAttributes > & { context: Context } ): ReactElement => {
	const blockProps = useBlockProps();

	// Remove the `style` prop from the block props to avoid passing it to the wrapper div.
	const { style, ...wrapperProps } = blockProps;
	const { isDescendentOfSingleProductTemplate } =
		useIsDescendentOfSingleProductTemplate();

	const blockAttrs = {
		...attributes,
		...context,
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Badge content', 'poocommerce' ) }>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Show', 'poocommerce' ) }
						value={ attributes.badgeContent || 'text' }
						onChange={ ( badgeContent ) => {
							if (
								badgeContent === 'text' ||
								badgeContent === 'amount' ||
								badgeContent === 'percentage'
							) {
								setAttributes( { badgeContent } );
							}
						} }
						options={ [
							{
								label: __( 'Text', 'poocommerce' ),
								value: 'text',
							},
							{
								label: __( 'Amount', 'poocommerce' ),
								value: 'amount',
							},
							{
								label: __( 'Percentage', 'poocommerce' ),
								value: 'percentage',
							},
						] }
					/>
					{ ! attributes.badgeContent ||
					attributes.badgeContent === 'text' ? (
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Text', 'poocommerce' ) }
							help={ sprintf(
								/* translators: %s: default sale badge text. */
								__(
									'If left empty, the badge will display ‘%s’.',
									'poocommerce'
								),
								__( 'Sale', 'poocommerce' )
							) }
							value={
								attributes.saleText ??
								__( 'Sale', 'poocommerce' )
							}
							onChange={ ( saleText ) =>
								setAttributes( { saleText } )
							}
						/>
					) : (
						<>
							<TextControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Prefix', 'poocommerce' ) }
								value={ attributes.prefix ?? '' }
								onChange={ ( prefix ) =>
									setAttributes( { prefix } )
								}
							/>
							<TextControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Suffix', 'poocommerce' ) }
								value={ attributes.suffix ?? '' }
								onChange={ ( suffix ) =>
									setAttributes( { suffix } )
								}
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...wrapperProps }>
				<Block
					{ ...blockAttrs }
					isDescendentOfSingleProductTemplate={
						isDescendentOfSingleProductTemplate
					}
				/>
			</div>
		</>
	);
};

export default Edit;
