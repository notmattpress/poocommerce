/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { getAdminLink, getSettingWithCoercion } from '@poocommerce/settings';
import { isBoolean } from '@poocommerce/types';
import type { BlockEditProps } from '@wordpress/blocks';
import { ProductQueryContext as Context } from '@poocommerce/blocks/product-query/types';
import {
	Disabled,
	PanelBody,
	ToggleControl,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControl` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControl` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import Block from './block';
import withProductSelector from '../shared/with-product-selector';
import { BLOCK_ICON as icon } from './constants';
import { title, description } from './block.json';
import { BlockAttributes, ImageSizing } from './types';
import { ImageSizeSettings } from './image-size-settings';

type SaleBadgeAlignProps = 'left' | 'center' | 'right';

const Edit = ( {
	attributes,
	setAttributes,
	context,
}: BlockEditProps< BlockAttributes > & { context: Context } ): JSX.Element => {
	const {
		showProductLink,
		imageSizing,
		showSaleBadge,
		saleBadgeAlign,
		width,
		height,
		scale,
	} = attributes;
	const blockProps = useBlockProps( { style: { width, height } } );
	const isDescendentOfQueryLoop = Number.isFinite( context.queryId );
	const isBlockThemeEnabled = getSettingWithCoercion(
		'isBlockThemeEnabled',
		false,
		isBoolean
	);

	useEffect(
		() => setAttributes( { isDescendentOfQueryLoop } ),
		[ setAttributes, isDescendentOfQueryLoop ]
	);

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<ImageSizeSettings
					scale={ scale }
					width={ width }
					height={ height }
					setAttributes={ setAttributes }
				/>
				<PanelBody title={ __( 'Content', 'poocommerce' ) }>
					<ToggleControl
						label={ __( 'Link to Product Page', 'poocommerce' ) }
						help={ __(
							'Links the image to the single product listing.',
							'poocommerce'
						) }
						checked={ showProductLink }
						onChange={ () =>
							setAttributes( {
								showProductLink: ! showProductLink,
							} )
						}
					/>
					<ToggleControl
						label={ __( 'Show On-Sale Badge', 'poocommerce' ) }
						help={ __(
							'Display a “sale” badge if the product is on-sale.',
							'poocommerce'
						) }
						checked={ showSaleBadge }
						onChange={ () =>
							setAttributes( {
								showSaleBadge: ! showSaleBadge,
							} )
						}
					/>
					{ showSaleBadge && (
						<ToggleGroupControl
							label={ __(
								'Sale Badge Alignment',
								'poocommerce'
							) }
							isBlock
							value={ saleBadgeAlign }
							onChange={ ( value: SaleBadgeAlignProps ) =>
								setAttributes( { saleBadgeAlign: value } )
							}
						>
							<ToggleGroupControlOption
								value="left"
								label={ __( 'Left', 'poocommerce' ) }
							/>
							<ToggleGroupControlOption
								value="center"
								label={ __( 'Center', 'poocommerce' ) }
							/>
							<ToggleGroupControlOption
								value="right"
								label={ __( 'Right', 'poocommerce' ) }
							/>
						</ToggleGroupControl>
					) }
					<ToggleGroupControl
						label={ __( 'Image Sizing', 'poocommerce' ) }
						isBlock
						help={
							! isBlockThemeEnabled
								? createInterpolateElement(
										__(
											'Product image cropping can be modified in the <a>Customizer</a>.',
											'poocommerce'
										),
										{
											a: (
												// eslint-disable-next-line jsx-a11y/anchor-has-content
												<a
													href={ `${ getAdminLink(
														'customize.php'
													) }?autofocus[panel]=poocommerce&autofocus[section]=poocommerce_product_images` }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										}
								  )
								: null
						}
						value={ imageSizing }
						onChange={ ( value: ImageSizing ) =>
							setAttributes( { imageSizing: value } )
						}
					>
						<ToggleGroupControlOption
							value={ ImageSizing.SINGLE }
							label={ __( 'Full Size', 'poocommerce' ) }
						/>
						<ToggleGroupControlOption
							value={ ImageSizing.THUMBNAIL }
							label={ __( 'Cropped', 'poocommerce' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>
			<Disabled>
				<Block { ...{ ...attributes, ...context } } />
			</Disabled>
		</div>
	);
};

export default withProductSelector( { icon, title, description } )( Edit );
