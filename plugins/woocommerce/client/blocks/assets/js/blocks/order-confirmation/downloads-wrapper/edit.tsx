/**
 * External dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getSetting } from '@poocommerce/settings';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import './editor.scss';

const Edit = ( {
	attributes,
	setAttributes,
}: {
	attributes: {
		heading: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ) => {
	const blockProps = useBlockProps();
	const hasDownloadableProducts = getSetting(
		'storeHasDownloadableProducts'
	);

	return (
		<div
			{ ...blockProps }
			className={ clsx( blockProps.className, {
				'store-has-downloads': hasDownloadableProducts,
			} ) }
		>
			<InnerBlocks
				allowedBlocks={ [ 'core/heading' ] }
				template={ [
					[
						'core/heading',
						{
							level: 2,
							style: { typography: { fontSize: '24px' } },
							content: attributes.heading || '',
							onChangeContent: ( value: string ) =>
								setAttributes( { heading: value } ),
						},
					],
					[
						'poocommerce/order-confirmation-downloads',
						{
							lock: {
								remove: true,
							},
						},
					],
				] }
			/>
		</div>
	);
};

export default Edit;
