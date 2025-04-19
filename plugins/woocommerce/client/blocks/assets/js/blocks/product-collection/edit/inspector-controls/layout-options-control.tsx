/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControl` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControlOption` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	// @ts-expect-error Using experimental features
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { DisplayLayoutControlProps, LayoutOptions } from '../../types';

const getHelpText = ( layoutOptions: LayoutOptions ) => {
	switch ( layoutOptions ) {
		case LayoutOptions.GRID:
			return __(
				'Display products using rows and columns.',
				'poocommerce'
			);
		case LayoutOptions.STACK:
			return __( 'Display products in a single column.', 'poocommerce' );
		default:
			return '';
	}
};

const DEFAULT_VALUE = LayoutOptions.GRID;

const LayoutOptionsControl = ( props: DisplayLayoutControlProps ) => {
	const { type, columns, shrinkColumns } = props.displayLayout;
	const setDisplayLayout = ( displayLayout: LayoutOptions ) => {
		props.setAttributes( {
			displayLayout: {
				type: displayLayout,
				columns,
				shrinkColumns,
			},
		} );
	};

	return (
		<ToolsPanelItem
			label={ __( 'Layout', 'poocommerce' ) }
			hasValue={ () => type !== DEFAULT_VALUE }
			isShownByDefault
			onDeselect={ () => {
				setDisplayLayout( LayoutOptions.GRID );
			} }
		>
			<ToggleGroupControl
				label={ __( 'Layout', 'poocommerce' ) }
				isBlock
				onChange={ ( value: LayoutOptions ) => {
					setDisplayLayout( value );
				} }
				help={ getHelpText( type ) }
				value={ type }
			>
				<ToggleGroupControlOption
					value={ LayoutOptions.STACK }
					label={ __( 'Stack', 'poocommerce' ) }
				/>
				<ToggleGroupControlOption
					value={ LayoutOptions.GRID }
					label={ __( 'Grid', 'poocommerce' ) }
				/>
			</ToggleGroupControl>
		</ToolsPanelItem>
	);
};

export default LayoutOptionsControl;
