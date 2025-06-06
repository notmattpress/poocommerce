// Reference: https://github.com/WordPress/gutenberg/blob/v16.4.0/packages/edit-site/src/components/sidebar-navigation-screen/index.js
/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
import clsx from 'clsx';
import { useState } from '@wordpress/element';
import {
	// @ts-ignore No types for this exist yet.
	__experimentalHStack as HStack,
	// @ts-ignore No types for this exist yet.
	__experimentalHeading as Heading,
	// @ts-ignore No types for this exist yet.
	__experimentalUseNavigator as useNavigator,
	// @ts-ignore No types for this exist yet.
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { isRTL, __ } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
// @ts-ignore No types for this exist yet.
import { privateApis as routerPrivateApis } from '@wordpress/router';
// @ts-ignore No types for this exist yet.
import { unlock } from '@wordpress/edit-site/build-module/lock-unlock';
// @ts-ignore No types for this exist yet.
import SidebarButton from '@wordpress/edit-site/build-module/components/sidebar-button';
import { GoBackWarningModal } from '../go-back-warning-modal';

/**
 * Internal dependencies
 */
import '../gutenberg-styles/sidebar-navigation-screen.scss';
import { isEntrepreneurFlow } from '~/customize-store/entrepreneur-flow';
const { useLocation } = unlock( routerPrivateApis );

export const SidebarNavigationScreen = ( {
	isRoot,
	title,
	actions,
	meta,
	content,
	footer,
	description,
	backPath: backPathProp,
	onNavigateBackClick,
}: {
	isRoot?: boolean;
	title: string;
	actions?: React.ReactNode;
	meta?: React.ReactNode;
	content: React.ReactNode;
	footer?: React.ReactNode;
	description?: React.ReactNode;
	backPath?: string;
	onNavigateBackClick?: () => void;
} ) => {
	const [ openWarningModal, setOpenWarningModal ] =
		useState< boolean >( false );
	const location = useLocation();
	const navigator = useNavigator();
	const icon = isRTL() ? chevronRight : chevronLeft;

	return (
		<>
			<VStack
				className={ clsx(
					'poocommerce-edit-site-sidebar-navigation-screen__main',
					{
						'has-footer': !! footer,
					}
				) }
				spacing={ 0 }
				justify="flex-start"
			>
				<HStack
					spacing={ 4 }
					alignment="flex-start"
					className="poocommerce-edit-site-sidebar-navigation-screen__title-icon"
				>
					{ ! isRoot && (
						<SidebarButton
							onClick={ () => {
								onNavigateBackClick?.();
								const backPath =
									backPathProp ?? location.state?.backPath;
								if ( backPath ) {
									navigator.goTo( backPath, {
										isBack: true,
									} );
								} else {
									navigator.goToParent();
								}
							} }
							icon={ icon }
							label={ __( 'Back', 'poocommerce' ) }
							showTooltip={ false }
						/>
					) }
					{ isRoot && ! isEntrepreneurFlow() && (
						<SidebarButton
							onClick={ () => {
								setOpenWarningModal( true );
							} }
							icon={ icon }
							label={ __( 'Back', 'poocommerce' ) }
							showTooltip={ false }
						/>
					) }
					<Heading
						className="poocommerce-edit-site-sidebar-navigation-screen__title"
						style={
							isEntrepreneurFlow() ? { padding: '0 16px' } : {}
						}
						color={ '#e0e0e0' /* $gray-200 */ }
						level={ 1 }
						as="h1"
					>
						{ title }
					</Heading>
					{ actions && (
						<div className="poocommerce-edit-site-sidebar-navigation-screen__actions">
							{ actions }
						</div>
					) }
				</HStack>
				{ meta && (
					<>
						<div className="poocommerce-edit-site-sidebar-navigation-screen__meta">
							{ meta }
						</div>
					</>
				) }

				<div className="poocommerce-edit-site-sidebar-navigation-screen__content">
					{ description && (
						<p className="poocommerce-edit-site-sidebar-navigation-screen__description">
							{ description }
						</p>
					) }
					{ content }
				</div>
			</VStack>
			{ footer && (
				<footer className="poocommerce-edit-site-sidebar-navigation-screen__footer">
					{ footer }
				</footer>
			) }
			{ openWarningModal && (
				<GoBackWarningModal
					setOpenWarningModal={ setOpenWarningModal }
					onExitClicked={ () => {
						window.parent.__wcCustomizeStore.sendEventToIntroMachine(
							{ type: 'GO_BACK_TO_DESIGN_WITHOUT_AI' }
						);
					} }
				/>
			) }
		</>
	);
};
