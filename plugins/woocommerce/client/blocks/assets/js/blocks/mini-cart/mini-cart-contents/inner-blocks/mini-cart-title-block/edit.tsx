/**
 * External dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export const Edit = (): JSX.Element => {
	const blockProps = useBlockProps( {
		className: 'wc-block-mini-cart__title',
	} );

	const TEMPLATE = [
		[ 'poocommerce/mini-cart-title-label-block', {} ],
		[ 'poocommerce/mini-cart-title-items-counter-block', {} ],
	];

	return (
		<h2 { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ [
					'poocommerce/mini-cart-title-label-block',
					'poocommerce/mini-cart-title-items-counter-block',
				] }
				template={ TEMPLATE }
				templateLock="all"
			/>
		</h2>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</div>
	);
};
