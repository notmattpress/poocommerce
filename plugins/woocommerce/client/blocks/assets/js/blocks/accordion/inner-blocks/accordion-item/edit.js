/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { PanelBody, ToggleControl } from '@wordpress/components';
import clsx from 'clsx';

const ACCORDION_HEADER_BLOCK_NAME = 'poocommerce/accordion-header';
const ACCORDION_PANEL_BLOCK_NAME = 'poocommerce/accordion-panel';

export default function Edit( {
	attributes: { openByDefault },
	clientId,
	setAttributes,
} ) {
	const isSelected = useSelect(
		( select ) => {
			const { isBlockSelected, hasSelectedInnerBlock } =
				select( blockEditorStore );
			return (
				isBlockSelected( clientId ) ||
				hasSelectedInnerBlock( clientId, true )
			);
		},
		[ clientId ]
	);

	const getBlockOrder = useSelect(
		( select ) => select( blockEditorStore ).getBlockOrder,
		[]
	);

	const contentBlockClientId = getBlockOrder( clientId )[ 1 ];
	const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } =
		useDispatch( blockEditorStore );

	useEffect( () => {
		if ( contentBlockClientId ) {
			__unstableMarkNextChangeAsNotPersistent();
			updateBlockAttributes( contentBlockClientId, {
				isSelected,
			} );
		}
	}, [
		isSelected,
		contentBlockClientId,
		__unstableMarkNextChangeAsNotPersistent,
		updateBlockAttributes,
	] );

	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps(
		{
			...blockProps,
			className: clsx( blockProps.className, {
				'is-open': openByDefault || isSelected,
			} ),
		},
		{
			template: [
				[ ACCORDION_HEADER_BLOCK_NAME, {} ],
				[
					ACCORDION_PANEL_BLOCK_NAME,
					{
						isSelected: true,
						openByDefault,
					},
				],
			],
			templateLock: 'all',
			directInsert: true,
		}
	);

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody title={ __( 'Settings', 'poocommerce' ) }>
					<ToggleControl
						label={ __( 'Open by default', 'poocommerce' ) }
						__nextHasNoMarginBottom
						onChange={ ( value ) => {
							setAttributes( {
								openByDefault: value,
							} );
							if ( contentBlockClientId ) {
								updateBlockAttributes( contentBlockClientId, {
									openByDefault: value,
								} );
							}
						} }
						checked={ openByDefault }
						help={ __(
							'Accordion content will be displayed by default.',
							'poocommerce'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
