/**
 * External dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const Save = () => {
	// We add the `poocommerce` class to the wrapper to apply PooCommerce styles to the block.
	const blockProps = useBlockProps.save( {
		className: 'poocommerce',
	} );

	return (
		<div { ...blockProps }>
			{ /* @ts-expect-error: `InnerBlocks.Content` is a component that is typed in WordPress core*/ }
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
