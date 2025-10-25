/**
 * External dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { InnerBlockTemplate } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';

const Edit = () => {
	const TEMPLATE: InnerBlockTemplate[] = [
		[
			'core/group',
			{ layout: { type: 'flex', flexWrap: 'nowrap' } },
			[
				[ 'poocommerce/product-sku' ],
				[
					'core/post-terms',
					{
						prefix: __( 'Category: ', 'poocommerce' ),
						term: 'product_cat',
					},
				],
				[
					'core/post-terms',
					{
						prefix: __( 'Tags: ', 'poocommerce' ),
						term: 'product_tag',
					},
				],
			],
		],
	];
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<InnerBlocks template={ TEMPLATE } />
		</div>
	);
};

export default Edit;
