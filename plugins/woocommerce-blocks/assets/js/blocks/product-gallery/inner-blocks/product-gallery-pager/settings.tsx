/**
 * External dependencies
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControl` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControl` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { PagerDisplayModes } from './constants';
import { PagerSettingsDigitsIcon, PagerSettingsDotIcon } from './icons';
import { ProductGalleryPagerContext } from '../../types';

const getHelpText = ( pagerDisplayMode: PagerDisplayModes ) => {
	switch ( pagerDisplayMode ) {
		case PagerDisplayModes.DIGITS:
			return __(
				'A list of numbers will show to indicate the number of items.',
				'poocommerce'
			);
		case PagerDisplayModes.DOTS:
			return __(
				'A series of dots will show to indicate the number of items.',
				'poocommerce'
			);
		case 'off':
			return __( 'No pager will be displayed.', 'poocommerce' );
		default:
			return __( 'No pager will be displayed.', 'poocommerce' );
	}
};

export const ProductGalleryPagerBlockSettings = ( {
	context,
}: {
	context: ProductGalleryPagerContext;
} ) => {
	const { productGalleryClientId, pagerDisplayMode } = context;
	// @ts-expect-error @wordpress/block-editor/store types not provided
	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	return (
		<ToggleGroupControl
			label={ __( 'Pager', 'poocommerce' ) }
			isBlock
			style={ {
				width: '100%',
			} }
			onChange={ ( value: PagerDisplayModes ) => {
				updateBlockAttributes( productGalleryClientId, {
					pagerDisplayMode: value,
				} );
			} }
			help={ getHelpText( pagerDisplayMode ) }
			value={ pagerDisplayMode }
		>
			<ToggleGroupControlOption
				value={ PagerDisplayModes.OFF }
				label={ __( 'Off', 'poocommerce' ) }
			/>
			<ToggleGroupControlOption
				value={ PagerDisplayModes.DOTS }
				label={ <PagerSettingsDotIcon /> }
			/>
			<ToggleGroupControlOption
				value={ PagerDisplayModes.DIGITS }
				label={ <PagerSettingsDigitsIcon /> }
			/>
		</ToggleGroupControl>
	);
};
