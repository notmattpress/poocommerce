// Reference: https://github.com/WordPress/gutenberg/tree/v16.4.0/packages/edit-site/src/components/layout/index.js
/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
import clsx from 'clsx';
import {
	useReducedMotion,
	useResizeObserver,
	useViewportMatch,
} from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useState, useContext } from '@wordpress/element';
import { __unstableMotion as motion } from '@wordpress/components';
import {
	// @ts-expect-error No types for this exist yet.
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
// @ts-expect-error No types for this exist yet.
import useInitEditedEntityFromURL from '@wordpress/edit-site/build-module/components/sync-state-with-url/use-init-edited-entity-from-url';
// @ts-expect-error No types for this exist yet.
import { useIsSiteEditorLoading } from '@wordpress/edit-site/build-module/components/layout/hooks';
// @ts-expect-error No types for this exist yet.
import ErrorBoundary from '@wordpress/edit-site/build-module/components/error-boundary';
// @ts-expect-error No types for this exist yet.
import { unlock } from '@wordpress/edit-site/build-module/lock-unlock';
// @ts-expect-error No types for this exist yet.
import { NavigableRegion } from '@wordpress/interface';
import { EntityProvider } from '@wordpress/core-data';
// @ts-expect-error No types for this exist yet.
import useEditedEntityRecord from '@wordpress/edit-site/build-module/components/use-edited-entity-record';

/**
 * Internal dependencies
 */
import { Editor } from './editor';
import Sidebar from './sidebar';
import { SiteHub } from './site-hub';
import { LogoBlockContext } from './logo-block-context';
import ResizableFrame from './resizable-frame';
import { OnboardingTour, useOnboardingTour } from './onboarding-tour';
import { HighlightedBlockContextProvider } from './context/highlighted-block-context';
import { Transitional } from '../transitional';
import { CustomizeStoreContext } from './';
import { trackEvent } from '../tracking';
import { SidebarNavigationExtraScreen } from './sidebar/navigation-extra-screen/sidebar-navigation-extra-screen';
import './gutenberg-styles/layout.scss';

const { useGlobalStyle } = unlock( blockEditorPrivateApis );

const ANIMATION_DURATION = 0.5;

export const Layout = () => {
	const [ logoBlockIds, setLogoBlockIds ] = useState< Array< string > >( [] );

	const { currentState } = useContext( CustomizeStoreContext );

	// This ensures the edited entity id and type are initialized properly.
	useInitEditedEntityFromURL();
	const {
		shouldTourBeShown,
		isResizeHandleVisible,
		setShowWelcomeTour,
		onClose,
		...onboardingTourProps
	} = useOnboardingTour();

	const takeTour = () => {
		// Click on "Take a tour" button
		trackEvent( 'customize_your_store_assembler_hub_tour_start' );
		setShowWelcomeTour( false );
	};

	const skipTour = () => {
		trackEvent( 'customize_your_store_assembler_hub_tour_skip' );
		onClose();
	};

	const isMobileViewport = useViewportMatch( 'medium', '<' );
	const disableMotion = useReducedMotion();
	const [ canvasResizer, canvasSize ] = useResizeObserver();
	const isEditorLoading = useIsSiteEditorLoading();
	const [ isResizableFrameOversized, setIsResizableFrameOversized ] =
		useState( false );
	const [ backgroundColor ] = useGlobalStyle( 'color.background' );
	const [ gradientValue ] = useGlobalStyle( 'color.gradient' );

	const { record: template } = useEditedEntityRecord();
	const { id: templateId, type: templateType } = template;

	const editor = <Editor isLoading={ isEditorLoading } />;

	if (
		typeof currentState === 'object' &&
		currentState.transitionalScreen === 'transitional'
	) {
		return (
			// @ts-expect-error Types are not correct when kind is root and type is site.
			<EntityProvider kind="root" type="site">
				<EntityProvider
					kind="postType"
					type={ templateType }
					id={ templateId }
				>
					<Transitional />
				</EntityProvider>
			</EntityProvider>
		);
	}

	return (
		// This causes the editor to re-render when the logo block ids change. Maybe we can find a better way to do this.
		<LogoBlockContext.Provider
			value={ {
				logoBlockIds,
				setLogoBlockIds,
			} }
		>
			<HighlightedBlockContextProvider>
				{ /* @ts-expect-error Types are not correct when kind is root and type is site. */ }
				<EntityProvider kind="root" type="site">
					<EntityProvider
						kind="postType"
						type={ templateType }
						id={ templateId }
					>
						<div
							className={ clsx( 'poocommerce-edit-site-layout' ) }
						>
							<motion.div
								className="poocommerce-edit-site-layout__header-container"
								animate={ 'view' }
							>
								<SiteHub
									isTransparent={ false }
									className="poocommerce-edit-site-layout__hub"
								/>
							</motion.div>

							<div className="poocommerce-edit-site-layout__content">
								<div className="poocommerce-edit-site-layout__sidebar">
									<NavigableRegion
										ariaLabel={ __(
											'Navigation',
											'poocommerce'
										) }
										className="poocommerce-edit-site-layout__sidebar-region"
									>
										<motion.div
											animate={ { opacity: 1 } }
											transition={ {
												type: 'tween',
												duration:
													// Disable transitiont in mobile to emulate a full page transition.
													disableMotion ||
													isMobileViewport
														? 0
														: ANIMATION_DURATION,
												ease: 'easeOut',
											} }
											className="poocommerce-edit-site-layout__sidebar"
										>
											<Sidebar />
										</motion.div>
									</NavigableRegion>
									<SidebarNavigationExtraScreen />
								</div>

								{ ! isMobileViewport && (
									<div className="poocommerce-edit-site-layout__canvas-container">
										{ canvasResizer }
										{ !! canvasSize.width && (
											<motion.div
												initial={ false }
												layout="position"
												className={ clsx(
													'poocommerce-edit-site-layout__canvas'
												) }
											>
												<ErrorBoundary>
													<ResizableFrame
														isReady={
															! isEditorLoading
														}
														isHandleVisibleByDefault={
															! onboardingTourProps.showWelcomeTour &&
															isResizeHandleVisible
														}
														isFullWidth={ false }
														defaultSize={ {
															width:
																canvasSize.width -
																24 /* $canvas-padding */,
															height: canvasSize.height,
														} }
														isOversized={
															isResizableFrameOversized
														}
														setIsOversized={
															setIsResizableFrameOversized
														}
														innerContentStyle={ {
															background:
																gradientValue ??
																backgroundColor,
														} }
													>
														{ editor }
													</ResizableFrame>
												</ErrorBoundary>
											</motion.div>
										) }
									</div>
								) }
							</div>
						</div>
						{ ! isEditorLoading && shouldTourBeShown && (
							<OnboardingTour
								skipTour={ skipTour }
								takeTour={ takeTour }
								onClose={ onClose }
								{ ...onboardingTourProps }
							/>
						) }
					</EntityProvider>
				</EntityProvider>
			</HighlightedBlockContextProvider>
		</LogoBlockContext.Provider>
	);
};
