/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { InnerBlockTemplate } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
	Warning,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { ProductDetailsEditProps } from './types';

const createAccordionItem = (
	title: string,
	content: InnerBlockTemplate[]
): InnerBlockTemplate => {
	return [
		'poocommerce/accordion-item',
		{},
		[
			[ 'poocommerce/accordion-header', { title }, [] ],
			[ 'poocommerce/accordion-panel', {}, content ],
		],
	];
};

const descriptionAccordion = createAccordionItem( 'Description', [
	[ 'poocommerce/product-description', {}, [] ],
] );

const additionalInformationAccordion = createAccordionItem(
	'Additional Information',
	[ [ 'poocommerce/product-specifications', {} ] ]
);

const reviewsAccordion = createAccordionItem( 'Reviews', [
	[ 'poocommerce/blockified-product-reviews', {} ],
] );

const TEMPLATE: InnerBlockTemplate[] = [
	[
		'poocommerce/accordion-group',
		{},
		[
			descriptionAccordion,
			additionalInformationAccordion,
			reviewsAccordion,
		],
	],
];

/**
 * Check if block is inside a Query Loop with non-product post type
 *
 * @param {string} clientId The block's client ID
 * @param {string} postType The current post type
 * @return {boolean} Whether the block is in an invalid Query Loop context
 */
const useIsInvalidQueryLoopContext = ( clientId: string, postType: string ) => {
	return useSelect(
		( select ) => {
			const blockParents = select(
				blockEditorStore
			).getBlockParentsByBlockName( clientId, 'core/post-template' );
			return blockParents.length > 0 && postType !== 'product';
		},
		[ clientId, postType ]
	);
};

const Edit = ( { clientId, context }: ProductDetailsEditProps ) => {
	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );

	const isInvalidQueryLoopContext = useIsInvalidQueryLoopContext(
		clientId,
		context.postType
	);
	if ( isInvalidQueryLoopContext ) {
		return (
			<div { ...blockProps }>
				<Warning>
					{ __(
						'The Product Details block requires a product context. When used in a Query Loop, the Query Loop must be configured to display products.',
						'poocommerce'
					) }
				</Warning>
			</div>
		);
	}
	return <div { ...innerBlocksProps } />;
};

export default Edit;
