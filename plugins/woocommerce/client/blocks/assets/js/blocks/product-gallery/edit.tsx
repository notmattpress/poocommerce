/**
 * External dependencies
 */
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { BlockEditProps, InnerBlockTemplate } from '@wordpress/blocks';
import { withProductDataContext } from '@poocommerce/shared-hocs';

/**
 * Internal dependencies
 */
import { ProductGalleryBlockSettings } from './block-settings/index';
import type { ProductGalleryBlockAttributes } from './types';

const TEMPLATE: InnerBlockTemplate[] = [
	[ 'poocommerce/product-gallery-thumbnails' ],
	[
		'poocommerce/product-gallery-large-image',
		{},
		[
			[
				'poocommerce/product-image',
				{
					showProductLink: false,
					showSaleBadge: false,
				},
			],
			[
				'poocommerce/product-sale-badge',
				{
					align: 'right',
				},
			],
			[ 'poocommerce/product-gallery-large-image-next-previous' ],
		],
	],
];

export const Edit = withProductDataContext(
	( {
		attributes,
		setAttributes,
	}: BlockEditProps< ProductGalleryBlockAttributes > ) => {
		const blockProps = useBlockProps( {
			className: 'wc-block-product-gallery',
		} );

		return (
			<div { ...blockProps }>
				<InspectorControls>
					<ProductGalleryBlockSettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</InspectorControls>
				<InnerBlocks
					allowedBlocks={ [
						'poocommerce/product-gallery-large-image',
						'poocommerce/product-gallery-thumbnails',
					] }
					template={ TEMPLATE }
				/>
			</div>
		);
	}
);
