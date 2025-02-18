/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	store as blockEditorStore,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	createBlock,
	type BlockEditProps,
	type BlockInstance,
} from '@wordpress/blocks';
import { select, dispatch } from '@wordpress/data';
import {
	createInterpolateElement,
	type ComponentType,
} from '@wordpress/element';
import { type EditorBlock } from '@poocommerce/types';
import { VARIATION_NAME as PQ_PRODUCT_SUMMARY_VARIATION_NAME } from '@poocommerce/blocks/product-query/variations/elements/product-summary';
import { VARIATION_NAME as PC_PRODUCT_SUMMARY_VARIATION_NAME } from '@poocommerce/blocks/product-collection/variations/elements/product-summary';
import { UpgradeDowngradeNotice } from '@poocommerce/editor-components/upgrade-downgrade-notice';

const CORE_NAME = 'core/post-excerpt';

const isProductSummaryBlockVariation = ( props: BlockInstance ) => {
	const pqVariation =
		props.attributes.__poocommerceNamespace ===
		PQ_PRODUCT_SUMMARY_VARIATION_NAME;
	const pcVariation =
		props.attributes.__poocommerceNamespace ===
		PC_PRODUCT_SUMMARY_VARIATION_NAME;

	return props.name === CORE_NAME && ( pqVariation || pcVariation );
};

const UpgradeNotice = ( { clientId }: { clientId: string } ) => {
	const notice = createInterpolateElement(
		__(
			"There's <strongText /> with important fixes and brand new features.",
			'poocommerce'
		),
		{
			strongText: (
				<strong>
					{ __( `new version of Product Summary`, 'poocommerce' ) }
				</strong>
			),
		}
	);

	const buttonLabel = __( 'Upgrade now (just this block)', 'poocommerce' );

	const handleClick = () => {
		const blocks =
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore No types for this exist yet.
			select( blockEditorStore ).getBlocksByClientId( clientId );

		if ( blocks.length ) {
			const currentBlock = blocks[ 0 ];
			const {
				excerptLength,
				showMoreOnNewLine,
				moreText,
				// Pass the styles to new block
				...restAttributes
			} = currentBlock.attributes;
			const productSummaryBlock = createBlock(
				'poocommerce/product-summary',
				restAttributes
			);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore No types for this exist yet.
			dispatch( blockEditorStore ).replaceBlock(
				clientId,
				productSummaryBlock
			);
		}
	};

	return (
		<UpgradeDowngradeNotice
			isDismissible={ false }
			actionLabel={ buttonLabel }
			onActionClick={ handleClick }
		>
			{ notice }
		</UpgradeDowngradeNotice>
	);
};

const withProductSummaryUpgradeNotice =
	< T extends EditorBlock< T > >( BlockEdit: ComponentType ) =>
	( props: BlockEditProps< T > ) => {
		return isProductSummaryBlockVariation( props ) ? (
			<>
				<InspectorControls>
					<UpgradeNotice clientId={ props.clientId } />
				</InspectorControls>
				<BlockEdit { ...props } />
			</>
		) : (
			<BlockEdit { ...props } />
		);
	};

addFilter(
	'editor.BlockEdit',
	'poocommerce-blocks/product-summary-upgrade-notice',
	withProductSummaryUpgradeNotice
);
