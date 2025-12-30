/**
 * External dependencies
 */
import { type ElementType, useEffect, useState } from '@wordpress/element';
import { EditorBlock } from '@poocommerce/types';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RadioControl,
	ToggleControl,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControl` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControlOption` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	getInputAndButtonOption,
	getSelectedRadioControlOption,
	isInputAndButtonOption,
	isWooSearchBlockVariation,
} from './utils';
import { ButtonPositionProps, ProductSearchBlockProps } from './types';
import { PositionOptions } from './constants';

const ProductSearchControls = ( props: ProductSearchBlockProps ) => {
	const { attributes, setAttributes } = props;
	const { buttonPosition, buttonUseIcon, showLabel } = attributes;
	const [ initialPosition, setInitialPosition ] =
		useState< ButtonPositionProps >( buttonPosition );

	useEffect( () => {
		if (
			isInputAndButtonOption( buttonPosition ) &&
			initialPosition !== buttonPosition
		) {
			setInitialPosition( buttonPosition );
		}
	}, [ buttonPosition ] );

	return (
		<InspectorControls group="styles">
			<PanelBody title={ __( 'Styles', 'poocommerce' ) }>
				<RadioControl
					selected={ getSelectedRadioControlOption( buttonPosition ) }
					options={ [
						{
							label: __( 'Input and button', 'poocommerce' ),
							value: PositionOptions.INPUT_AND_BUTTON,
						},
						{
							label: __( 'Input only', 'poocommerce' ),
							value: PositionOptions.NO_BUTTON,
						},
						{
							label: __( 'Button only', 'poocommerce' ),
							value: PositionOptions.BUTTON_ONLY,
						},
					] }
					onChange={ (
						selected: Partial< ButtonPositionProps > &
							PositionOptions.INPUT_AND_BUTTON
					) => {
						if ( selected !== PositionOptions.INPUT_AND_BUTTON ) {
							setAttributes( {
								buttonPosition: selected,
							} );
						} else {
							const newButtonPosition =
								getInputAndButtonOption( initialPosition );
							setAttributes( {
								buttonPosition: newButtonPosition,
							} );
						}
					} }
				/>
				{ buttonPosition !== PositionOptions.NO_BUTTON && (
					<>
						{ buttonPosition !== PositionOptions.BUTTON_ONLY && (
							<ToggleGroupControl
								label={ __( 'BUTTON POSITION', 'poocommerce' ) }
								isBlock
								onChange={ ( value: ButtonPositionProps ) => {
									setAttributes( {
										buttonPosition: value,
									} );
								} }
								value={ getInputAndButtonOption(
									buttonPosition
								) }
							>
								<ToggleGroupControlOption
									value={ PositionOptions.INSIDE }
									label={ __( 'Inside', 'poocommerce' ) }
								/>
								<ToggleGroupControlOption
									value={ PositionOptions.OUTSIDE }
									label={ __( 'Outside', 'poocommerce' ) }
								/>
							</ToggleGroupControl>
						) }
						<ToggleGroupControl
							label={ __( 'BUTTON APPEARANCE', 'poocommerce' ) }
							isBlock
							onChange={ ( value: boolean ) => {
								setAttributes( {
									buttonUseIcon: value,
								} );
							} }
							value={ buttonUseIcon }
						>
							<ToggleGroupControlOption
								value={ false }
								label={ __( 'Text', 'poocommerce' ) }
							/>
							<ToggleGroupControlOption
								value={ true }
								label={ __( 'Icon', 'poocommerce' ) }
							/>
						</ToggleGroupControl>
					</>
				) }
				<ToggleControl
					label={ __( 'Show input label', 'poocommerce' ) }
					checked={ showLabel }
					onChange={ ( showInputLabel: boolean ) =>
						setAttributes( {
							showLabel: showInputLabel,
						} )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export const withProductSearchControls =
	< T extends EditorBlock< T > >( BlockEdit: ElementType ) =>
	( props: ProductSearchBlockProps ) => {
		return isWooSearchBlockVariation( props ) ? (
			<>
				<ProductSearchControls { ...props } />
				<BlockEdit { ...props } />
			</>
		) : (
			<BlockEdit { ...props } />
		);
	};
