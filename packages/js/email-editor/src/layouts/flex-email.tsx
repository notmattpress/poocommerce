/**
 * External dependencies
 */
import clsx from 'clsx';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { getBlockSupport, hasBlockSupport } from '@wordpress/blocks';
import { Block } from '@wordpress/blocks/index';
import { __ } from '@wordpress/i18n';
import { justifyLeft, justifyCenter, justifyRight } from '@wordpress/icons';
import {
	Flex,
	FlexItem,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import {
	BlockControls,
	InspectorControls,
	// @ts-expect-error No types for this exist yet.
	JustifyContentControl,
} from '@wordpress/block-editor';

const layoutBlockSupportKey = '__experimentalEmailFlexLayout';

function hasLayoutBlockSupport( blockName: string ) {
	// @ts-expect-error No types for this exist yet.
	return hasBlockSupport( blockName, layoutBlockSupportKey );
}

function JustificationControls( {
	justificationValue,
	onChange,
	isToolbar = false,
} ) {
	const justificationOptions = [
		{
			value: 'left',
			icon: justifyLeft,
			label: __( 'Justify items left', 'poocommerce' ),
		},
		{
			value: 'center',
			icon: justifyCenter,
			label: __( 'Justify items center', 'poocommerce' ),
		},
		{
			value: 'right',
			icon: justifyRight,
			label: __( 'Justify items right', 'poocommerce' ),
		},
	];

	if ( isToolbar ) {
		const allowedValues = justificationOptions.map(
			( option ) => option.value
		);
		return (
			<JustifyContentControl
				value={ justificationValue }
				onChange={ onChange }
				allowedControls={ allowedValues }
				popoverProps={ {
					placement: 'bottom-start',
				} }
			/>
		);
	}

	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			label={ __( 'Justification', 'poocommerce' ) }
			value={ justificationValue }
			onChange={ onChange }
			className="block-editor-hooks__flex-layout-justification-controls"
		>
			{ justificationOptions.map( ( { value, icon, label } ) => (
				<ToggleGroupControlOptionIcon
					key={ value }
					value={ value }
					icon={ icon }
					label={ label }
				/>
			) ) }
		</ToggleGroupControl>
	);
}

function LayoutControls( { setAttributes, attributes, name: blockName } ) {
	const layoutBlockSupport = getBlockSupport(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		blockName,
		// @ts-expect-error No types for this exist yet.
		layoutBlockSupportKey,
		{}
	);

	if ( ! layoutBlockSupport ) {
		return null;
	}

	const { justifyContent = 'left' } = attributes.layout || {};

	const onJustificationChange = ( value ) => {
		setAttributes( {
			layout: {
				...attributes.layout,
				justifyContent: value,
			},
		} );
	};

	const resetAll = () => {
		const { justifyContent: _discarded, ...restLayout } =
			attributes.layout || {};
		setAttributes( {
			layout: restLayout,
		} );
	};

	return (
		<>
			<InspectorControls>
				<ToolsPanel
					label={ __( 'Layout', 'poocommerce' ) }
					resetAll={ resetAll }
				>
					<ToolsPanelItem
						isShownByDefault
						onDeselect={ resetAll } // This attribute is usually used to reset the panel item value.
						hasValue={ () =>
							attributes.layout?.justifyContent || false
						}
						label={ __( 'Justification', 'poocommerce' ) }
					>
						<Flex>
							<FlexItem>
								<JustificationControls
									justificationValue={ justifyContent }
									onChange={ onJustificationChange }
								/>
							</FlexItem>
						</Flex>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>
			{ /* @ts-expect-error No types for this exist yet. */ }
			<BlockControls group="block" __experimentalShareWithChildBlocks>
				<JustificationControls
					justificationValue={ justifyContent }
					onChange={ onJustificationChange }
					isToolbar
				/>
			</BlockControls>
		</>
	);
}

/**
 * Filters registered block settings, extending attributes to include `layout`.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addAttribute( settings: Block ) {
	if ( hasLayoutBlockSupport( settings.name ) ) {
		return {
			...settings,
			attributes: {
				...settings.attributes,
				layout: {
					type: 'object',
				},
			},
		};
	}
	return settings;
}

/**
 * Override the default edit UI to include layout controls
 *
 * @param {Function} BlockEdit Original component.
 *
 * @return {Function} Wrapped component.
 */
export const withLayoutControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const supportLayout = hasLayoutBlockSupport( props.name );

		return [
			supportLayout && <LayoutControls key="layout" { ...props } />,
			<BlockEdit key="edit" { ...props } />,
		];
	},
	'withLayoutControls'
);

function BlockWithLayoutStyles( { block: BlockListBlock, props } ) {
	const { attributes } = props;
	const { layout } = attributes;

	const layoutClasses = 'is-layout-email-flex is-layout-flex';
	const justify = ( layout?.justifyContent as string ) || 'left';
	const justificationClass = `is-content-justification-${ justify }`;

	const layoutClassNames = clsx( justificationClass, layoutClasses );
	return <BlockListBlock { ...props } className={ layoutClassNames } />;
}

/**
 * Override the default block element to add the layout classes.
 *
 * @param {Function} BlockListBlock Original component.
 *
 * @return {Function} Wrapped component.
 */
export const withLayoutStyles = createHigherOrderComponent(
	( BlockListBlock ) =>
		function maybeWrapWithLayoutStyles( props ) {
			const blockSupportsLayout = hasLayoutBlockSupport(
				props.name as string
			);
			if ( ! blockSupportsLayout ) {
				return <BlockListBlock { ...props } />;
			}

			return (
				<BlockWithLayoutStyles
					block={ BlockListBlock }
					props={ props }
				/>
			);
		},
	'withLayoutStyles'
);

export function initializeLayout() {
	addFilter(
		'blocks.registerBlockType',
		'poocommerce-email-editor/layout/addAttribute',
		addAttribute
	);
	addFilter(
		'editor.BlockListBlock',
		'poocommerce-email-editor/with-layout-styles',
		withLayoutStyles
	);
	addFilter(
		'editor.BlockEdit',
		'poocommerce-email-editor/with-inspector-controls',
		withLayoutControls
	);
}
