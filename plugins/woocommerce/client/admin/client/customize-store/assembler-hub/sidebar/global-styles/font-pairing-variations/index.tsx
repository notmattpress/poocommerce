/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
// @ts-ignore No types for this exist yet.
import { __experimentalGrid as Grid, Spinner } from '@wordpress/components';
import { optionsStore } from '@poocommerce/data';
import { useSelect } from '@wordpress/data';
import { useContext, useMemo } from '@wordpress/element';
import {
	// @ts-expect-error No types for this exist yet.
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
// @ts-expect-error no types exist yet.
import { unlock } from '@wordpress/edit-site/build-module/lock-unlock';

/**
 * Internal dependencies
 */
import {
	FONT_PAIRINGS_WHEN_AI_IS_OFFLINE,
	FONT_PAIRINGS_WHEN_USER_DID_NOT_ALLOW_TRACKING,
} from './constants';
import { VariationContainer } from '../variation-container';
import { FontPairingVariationPreview } from './preview';
import { CustomizeStoreContext } from '~/customize-store/assembler-hub';
import { FontFamily } from './font-families-loader-dot-com';
import {
	OptInContext,
	OPTIN_FLOW_STATUS,
} from '~/customize-store/assembler-hub/opt-in/context';

export const FontPairing = () => {
	const { useGlobalSetting } = unlock( blockEditorPrivateApis );

	const [ custom ] = useGlobalSetting( 'typography.fontFamilies.custom' ) as [
		Array< FontFamily > | undefined
	];

	// theme.json file font families
	const [ baseFontFamilies ] = useGlobalSetting(
		'typography.fontFamilies',
		undefined,
		'base'
	) as [
		{
			theme: Array< FontFamily >;
		}
	];

	const { context } = useContext( CustomizeStoreContext );
	const isFontLibraryAvailable = context.isFontLibraryAvailable;
	const trackingAllowed = useSelect(
		( select ) =>
			select( optionsStore ).getOption( 'poocommerce_allow_tracking' ) ===
			'yes',
		[]
	);

	const { optInFlowStatus } = useContext( OptInContext );

	const fontPairings = useMemo( () => {
		const defaultFonts = FONT_PAIRINGS_WHEN_USER_DID_NOT_ALLOW_TRACKING.map(
			( pair ) => {
				const fontFamilies = pair.settings.typography.fontFamilies;

				const fonts = baseFontFamilies.theme.filter(
					( baseFontFamily ) =>
						fontFamilies.theme.some(
							( themeFont ) =>
								themeFont.fontFamily === baseFontFamily.name
						)
				);

				return {
					...pair,
					settings: {
						typography: {
							fontFamilies: {
								theme: fonts,
							},
						},
					},
				};
			}
		);

		// We only show the default fonts when:
		// - user did not allow tracking
		// - site doesn't have the Font Library available
		// - opt-in flow is still processing
		if (
			! trackingAllowed ||
			! isFontLibraryAvailable ||
			optInFlowStatus !== OPTIN_FLOW_STATUS.DONE
		) {
			return defaultFonts;
		}

		const customFonts = FONT_PAIRINGS_WHEN_AI_IS_OFFLINE.map( ( pair ) => {
			const fontFamilies = pair.settings.typography.fontFamilies;
			const fonts =
				custom?.filter( ( customFont ) =>
					fontFamilies.theme.some(
						( themeFont ) => themeFont.slug === customFont.slug
					)
				) ?? [];

			return {
				...pair,
				settings: {
					typography: {
						fontFamilies: {
							theme: fonts,
						},
					},
				},
			};
		} );

		return [ ...defaultFonts, ...customFonts ];
	}, [
		baseFontFamilies.theme,
		custom,
		isFontLibraryAvailable,
		optInFlowStatus,
		trackingAllowed,
	] );

	if ( optInFlowStatus === OPTIN_FLOW_STATUS.LOADING ) {
		return (
			<div className="poocommerce-customize-store_font-pairing-spinner-container">
				<Spinner />
			</div>
		);
	}

	return (
		<Grid
			columns={ 2 }
			gap={ 3 }
			className="poocommerce-customize-store_font-pairing-container"
			style={ {
				opacity: 0,
				animation: 'containerFadeIn 300ms ease-in-out forwards',
			} }
		>
			{ fontPairings.map( ( variation, index ) => (
				<VariationContainer key={ index } variation={ variation }>
					<FontPairingVariationPreview />
				</VariationContainer>
			) ) }
		</Grid>
	);
};
