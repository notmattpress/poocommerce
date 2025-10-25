/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import interpolateComponents from '@automattic/interpolate-components';
import { getNewPath } from '@poocommerce/navigation';
import { Sender } from 'xstate';
import { Notice } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { CustomizeStoreComponent } from '../types';
import { SiteHub } from '../assembler-hub/site-hub';
import { ThemeSwitchWarningModal } from './warning-modals';
import { useNetworkStatus } from '~/utils/react-hooks/use-network-status';
import './intro.scss';
import {
	NetworkOfflineBanner,
	JetpackOfflineBanner,
	NoAIBanner,
	ExistingNoAiThemeBanner,
	ClassicThemeBanner,
	NonDefaultBlockThemeBanner,
	PickYourThemeBanner,
} from './intro-banners';
import welcomeTourImg from '../assets/images/design-your-own.svg';
import professionalThemeImg from '../assets/images/professional-theme.svg';
import { navigateOrParent } from '~/customize-store/utils';
import { customizeStoreStateMachineEvents } from '~/customize-store';
import { trackEvent } from '~/customize-store/tracking';

export type events =
	| { type: 'JETPACK_OFFLINE_HOWTO' }
	| { type: 'CLICKED_ON_BREADCRUMB' }
	| { type: 'SELECTED_BROWSE_ALL_THEMES' }
	| { type: 'SELECTED_ACTIVE_THEME'; payload: { theme: string } }
	| { type: 'SELECTED_NEW_THEME'; payload: { theme: string } }
	| { type: 'DESIGN_WITHOUT_AI' };

export * as actions from './actions';
export * as services from './services';

type BannerStatus = keyof typeof BANNER_COMPONENTS;

const BANNER_COMPONENTS = {
	'network-offline': NetworkOfflineBanner,
	'jetpack-offline': JetpackOfflineBanner,
	'no-ai': NoAIBanner,
	'existing-no-ai-theme': ExistingNoAiThemeBanner,
	'classic-theme': ClassicThemeBanner,
	'non-default-block-theme': NonDefaultBlockThemeBanner,
};

const CustomizedThemeBanners = ( {
	isBlockTheme,
	isDefaultTheme,
	sendEvent,
}: {
	isBlockTheme: boolean | undefined;
	isDefaultTheme: boolean | undefined;
	sendEvent: Sender< customizeStoreStateMachineEvents >;
} ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	return (
		<>
			<p className="select-theme-text">
				{ __( 'Design or choose a new theme', 'poocommerce' ) }
			</p>

			<div className="poocommerce-customize-store-cards">
				<div className="intro-card">
					<img
						src={ welcomeTourImg }
						alt={ __( 'Design your own theme', 'poocommerce' ) }
					/>

					<div>
						<h2 className="intro-card__title">
							{ __( 'Design your own theme', 'poocommerce' ) }
						</h2>

						<button
							className="intro-card__link"
							onClick={ () => {
								trackEvent(
									'customize_your_store_intro_design_theme',
									{
										theme_type: isBlockTheme
											? 'block'
											: 'classic',
									}
								);
								if ( isDefaultTheme ) {
									navigateOrParent(
										window,
										getNewPath(
											{ customizing: true },
											'/customize-store/assembler-hub',
											{}
										)
									);
								} else {
									setIsModalOpen( true );
								}
							} }
						>
							{ __( 'Use the store designer', 'poocommerce' ) }
						</button>
					</div>
				</div>

				<div className="intro-card">
					<img
						src={ professionalThemeImg }
						alt={ __(
							'Choose a professionally designed theme',
							'poocommerce'
						) }
					/>

					<div>
						<h2 className="intro-card__title">
							{ __(
								'Choose a professionally designed theme',
								'poocommerce'
							) }
						</h2>

						<button
							className="intro-card__link"
							onClick={ () => {
								trackEvent(
									'customize_your_store_intro_browse_themes'
								);
								sendEvent( {
									type: 'SELECTED_BROWSE_ALL_THEMES',
								} );
							} }
						>
							{ __( 'Browse themes', 'poocommerce' ) }
						</button>
					</div>
				</div>
			</div>
			{ isModalOpen && (
				<ThemeSwitchWarningModal
					setIsModalOpen={ setIsModalOpen }
					redirectToCYSFlow={ () =>
						sendEvent( {
							type: 'DESIGN_WITHOUT_AI',
						} )
					}
				/>
			) }
		</>
	);
};

export const Intro: CustomizeStoreComponent = ( { sendEvent, context } ) => {
	const {
		intro: { activeTheme, customizeStoreTaskCompleted },
	} = context;

	const isJetpackOffline = false;

	const isNetworkOffline = useNetworkStatus();

	const [ showError, setShowError ] = useState( context.intro.hasErrors );

	const errorMessage =
		context.intro.errorStatus === 403
			? __(
					"Sorry, you don't have permission to update the theme.",
					'poocommerce'
			  )
			: __(
					'Oops! We encountered a problem while setting up the foundations. {{anchor}}Please try again{{/anchor}} or start with a theme.',
					'poocommerce'
			  );

	let bannerStatus: BannerStatus = 'no-ai';

	const isDefaultTheme = activeTheme === 'twentytwentyfour';
	interface Theme {
		is_block_theme?: boolean;
	}

	const currentTheme = useSelect( ( select ) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return select( 'core' ).getCurrentTheme() as Theme;
	}, [] );

	const isBlockTheme = currentTheme?.is_block_theme;

	switch ( true ) {
		case isNetworkOffline:
			bannerStatus = 'network-offline';
			break;
		case isJetpackOffline as boolean:
			bannerStatus = 'jetpack-offline';
			break;
		case ! isBlockTheme:
			bannerStatus = 'classic-theme';
			break;
		case isBlockTheme && ! isDefaultTheme:
			bannerStatus = 'non-default-block-theme';
			break;
		case ! customizeStoreTaskCompleted:
			bannerStatus = 'no-ai';
			break;
		case customizeStoreTaskCompleted:
			bannerStatus = 'existing-no-ai-theme';
			break;
	}

	const BannerComponent = BANNER_COMPONENTS[
		bannerStatus
	] as React.ComponentType< {
		redirectToCYSFlow: () => void;
		sendEvent: Sender< customizeStoreStateMachineEvents >;
	} >;

	const sidebarMessage = __(
		'Design a store that reflects your brand and business. Customize your active theme, select a professionally designed theme, or create a new look using our store designer.',
		'poocommerce'
	);

	return (
		<>
			<div className="poocommerce-customize-store-header">
				<SiteHub
					isTransparent={ false }
					className="poocommerce-customize-store__content"
				/>
			</div>

			<div className="poocommerce-customize-store-container">
				<div className="poocommerce-customize-store-sidebar">
					<div className="poocommerce-customize-store-sidebar__title">
						<button
							onClick={ () => {
								sendEvent( 'CLICKED_ON_BREADCRUMB' );
							} }
						>
							{ chevronLeft }
						</button>
						{ __( 'Customize your store', 'poocommerce' ) }
					</div>
					<p>{ sidebarMessage }</p>
				</div>

				<div className="poocommerce-customize-store-main">
					{ showError && (
						<Notice
							onRemove={ () => setShowError( false ) }
							className="poocommerce-cys-design-with-ai__error-notice"
							status="error"
						>
							{ interpolateComponents( {
								mixedString: errorMessage,
								components: {
									anchor: (
										// eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid
										<a
											className="poocommerce-customize-store-error-link"
											onClick={ () =>
												sendEvent( 'DESIGN_WITHOUT_AI' )
											}
										/>
									),
								},
							} ) }
						</Notice>
					) }
					<BannerComponent
						redirectToCYSFlow={ () =>
							sendEvent( 'DESIGN_WITHOUT_AI' )
						}
						sendEvent={ sendEvent }
					/>

					{ isDefaultTheme && ! customizeStoreTaskCompleted ? (
						<PickYourThemeBanner sendEvent={ sendEvent } />
					) : (
						<CustomizedThemeBanners
							isBlockTheme={ isBlockTheme }
							isDefaultTheme={ isDefaultTheme }
							sendEvent={ sendEvent }
						/>
					) }
				</div>
			</div>
		</>
	);
};
