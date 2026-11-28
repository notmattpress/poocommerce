/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import clsx from 'clsx';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import BlockTitle from '@poocommerce/editor-components/block-title';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Disabled,
	PanelBody,
	ToggleControl,
	withSpokenMessages,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import Block from './block';
import './editor.scss';
import { Attributes } from './types';
import { UpgradeNotice } from '../filter-wrapper/upgrade';

const Edit = ( {
	clientId,
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) => {
	const {
		className,
		heading,
		headingLevel,
		showCounts,
		showFilterButton,
		selectType,
		displayStyle,
	} = attributes;

	const blockProps = useBlockProps( {
		className: clsx( 'wc-block-stock-filter', className ),
	} );

	const getInspectorControls = () => {
		return (
			<InspectorControls key="inspector">
				<PanelBody>
					<UpgradeNotice clientId={ clientId } />
				</PanelBody>
				<ToolsPanel
					label={ __( 'Display Settings', 'poocommerce' ) }
					resetAll={ () =>
						setAttributes( {
							showCounts: false,
							showFilterButton: false,
							displayStyle: 'list',
							selectType: 'multiple',
						} )
					}
				>
					<ToolsPanelItem
						label={ __( 'Display product count', 'poocommerce' ) }
						hasValue={ () => showCounts !== false }
						onDeselect={ () =>
							setAttributes( { showCounts: false } )
						}
						isShownByDefault
					>
						<ToggleControl
							label={ __(
								'Display product count',
								'poocommerce'
							) }
							checked={ showCounts }
							onChange={ () =>
								setAttributes( {
									showCounts: ! showCounts,
								} )
							}
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={ __(
							'Allow selecting multiple options?',
							'poocommerce'
						) }
						hasValue={ () => selectType !== 'multiple' }
						onDeselect={ () =>
							setAttributes( { selectType: 'multiple' } )
						}
						isShownByDefault
					>
						<ToggleGroupControl
							label={ __(
								'Allow selecting multiple options?',
								'poocommerce'
							) }
							isBlock
							value={ selectType || 'multiple' }
							onChange={ ( value: string ) =>
								setAttributes( {
									selectType: value,
								} )
							}
							className="wc-block-attribute-filter__multiple-toggle"
						>
							<ToggleGroupControlOption
								value="multiple"
								label={ _x(
									'Multiple',
									'Number of filters',
									'poocommerce'
								) }
							/>
							<ToggleGroupControlOption
								value="single"
								label={ _x(
									'Single',
									'Number of filters',
									'poocommerce'
								) }
							/>
						</ToggleGroupControl>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={ __( 'Display Style', 'poocommerce' ) }
						hasValue={ () => displayStyle !== 'list' }
						onDeselect={ () =>
							setAttributes( { displayStyle: 'list' } )
						}
						isShownByDefault
					>
						<ToggleGroupControl
							label={ __( 'Display Style', 'poocommerce' ) }
							isBlock
							value={ displayStyle }
							onChange={ ( value ) =>
								setAttributes( {
									displayStyle: value,
								} )
							}
							className="wc-block-attribute-filter__display-toggle"
						>
							<ToggleGroupControlOption
								value="list"
								label={ __( 'List', 'poocommerce' ) }
							/>
							<ToggleGroupControlOption
								value="dropdown"
								label={ __( 'Dropdown', 'poocommerce' ) }
							/>
						</ToggleGroupControl>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={ __(
							"Show 'Apply filters' button",
							'poocommerce'
						) }
						hasValue={ () => showFilterButton !== false }
						onDeselect={ () =>
							setAttributes( { showFilterButton: false } )
						}
						isShownByDefault
					>
						<ToggleControl
							label={ __(
								"Show 'Apply filters' button",
								'poocommerce'
							) }
							help={ __(
								'Products will update when the button is clicked.',
								'poocommerce'
							) }
							checked={ showFilterButton }
							onChange={ ( value ) =>
								setAttributes( {
									showFilterButton: value,
								} )
							}
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>
		);
	};

	return (
		<>
			{ getInspectorControls() }
			{
				<div { ...blockProps }>
					{ heading && (
						<BlockTitle
							className="wc-block-stock-filter__title"
							headingLevel={ headingLevel }
							heading={ heading }
							onChange={ ( value: string ) =>
								setAttributes( { heading: value } )
							}
						/>
					) }
					<Disabled>
						<Block attributes={ attributes } isEditor={ true } />
					</Disabled>
				</div>
			}
		</>
	);
};

export default withSpokenMessages( Edit );
