/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @poocommerce/dependency-group */
/**
 * External dependencies
 */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
// @ts-ignore No types for this exist yet.
import SidebarNavigationItem from '@wordpress/edit-site/build-module/components/sidebar-navigation-item';
import clsx from 'clsx';
import {
	Button,
	// @ts-ignore No types for this exist yet.
	__experimentalItemGroup as ItemGroup,
	// @ts-ignore No types for this exist yet.
	__unstableMotion as motion,
} from '@wordpress/components';
import { useOnboardingContext } from '~/settings-payments/onboarding/providers/woopayments/data/onboarding-context';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import type { SidebarComponentProps } from '../xstate';
import { SidebarContainer } from './sidebar-container';
import { SiteHub } from '~/customize-store/assembler-hub/site-hub';
import { taskIcons, taskCompleteIcon } from './icons';
import { StepPlaceholder } from './step-placeholder';
import { useSetUpPaymentsContext } from '~/launch-your-store/data/setup-payments-context';
import { WooPaymentsProviderOnboardingStep } from '~/settings-payments/onboarding/types';
import { recordPaymentsOnboardingEvent } from '~/settings-payments/utils';
import { wooPaymentsOnboardingSessionEntryLYS } from '~/settings-payments/constants';

export const PaymentsSidebar = ( props: SidebarComponentProps ) => {
	const { wooPaymentsRecentlyActivated, isWooPaymentsActive } =
		useSetUpPaymentsContext();

	const {
		steps: allSteps,
		currentStep,
		justCompletedStepId,
		isLoading,
	} = useOnboardingContext();

	const { context } = props;
	const payments_task = context.tasklist?.tasks?.find(
		( task ) => task.id === 'payments'
	);

	const currentStepIndex = allSteps.findIndex(
		( step ) => step.id === currentStep?.id
	);

	const isStepCompleted = (
		step: WooPaymentsProviderOnboardingStep
	): boolean => {
		return (
			step.id === justCompletedStepId ||
			step.status === 'completed' ||
			currentStepIndex === allSteps.length
		);
	};

	// Sort steps to show completed ones first
	const sortedSteps = allSteps.sort( ( a, b ) => {
		const aCompleted = isStepCompleted( a );
		const bCompleted = isStepCompleted( b );

		if ( aCompleted === bCompleted ) {
			return 0;
		}
		return aCompleted ? -1 : 1;
	} );

	const sidebarTitle = (
		<Button
			onClick={ () => {
				recordEvent( 'launch_your_store_payments_back_to_hub_click' );

				// Record the "modal" being closed to keep consistency with the Payments Settings flow.
				recordPaymentsOnboardingEvent(
					'woopayments_onboarding_modal_closed',
					{
						from: 'lys_sidebar_back_to_hub',
						source: wooPaymentsOnboardingSessionEntryLYS,
					}
				);

				// Clear session flag to prevent redirect back to payments setup
				// after exiting the flow and returning to the WC Admin home.
				window.sessionStorage.setItem( 'lysWaiting', 'no' );

				props.sendEventToSidebar( {
					type: 'RETURN_FROM_PAYMENTS',
				} );
			} }
		>
			{ __( 'Set up WooPayments', 'poocommerce' ) }
		</Button>
	);

	const InstallWooPaymentsStep = ( {
		isStepComplete,
	}: {
		isStepComplete: boolean;
	} ) => (
		<SidebarNavigationItem
			key="install-woopayments"
			className={ clsx( 'install-woopayments', {
				active: isStepComplete,
				'payment-step': true,
				'payment-step--active': isStepComplete,
				'payment-step--disabled': isStepComplete,
				'is-complete': isStepComplete,
			} ) }
			icon={
				isStepComplete ? taskCompleteIcon : taskIcons.activePaymentStep
			}
			disabled={ true }
			showChevron={ false }
		>
			{ payments_task?.additionalData?.wooPaymentsIsInstalled
				? /* translators: %s: WooPayments */
				  sprintf( __( 'Enable %s', 'poocommerce' ), 'WooPayments' )
				: /* translators: %s: WooPayments */
				  sprintf( __( 'Install %s', 'poocommerce' ), 'WooPayments' ) }
		</SidebarNavigationItem>
	);

	return (
		<div
			className={ clsx(
				'launch-store-sidebar__container',
				props.className
			) }
		>
			<motion.div
				className="poocommerce-edit-site-layout__header-container"
				animate={ 'view' }
			>
				<SiteHub
					variants={ {
						view: { x: 0 },
					} }
					isTransparent={ false }
					className="poocommerce-edit-site-layout__hub"
				/>
			</motion.div>
			<SidebarContainer
				title={ sidebarTitle }
				onMobileClose={ props.onMobileClose }
			>
				{ /* We are using these classes to inherit the styles from the edit your store styling */ }
				<ItemGroup className="poocommerce-edit-site-sidebar-navigation-screen-essential-tasks__group">
					{ ! isWooPaymentsActive && (
						<motion.div
							initial={ { opacity: 0, y: 0 } }
							animate={ { opacity: 1, y: 0 } }
							transition={ { duration: 0.7, delay: 0.2 } }
						>
							<InstallWooPaymentsStep isStepComplete={ false } />
						</motion.div>
					) }
					{ isWooPaymentsActive && isLoading && (
						<motion.div
							initial={ { opacity: 0 } }
							animate={ { opacity: 1 } }
							exit={ { opacity: 0 } }
							transition={ { duration: 0.3 } }
						>
							<StepPlaceholder rows={ 3 } />
						</motion.div>
					) }
					{ isWooPaymentsActive && ! isLoading && (
						<motion.div
							initial={ { opacity: 0, y: 0 } }
							animate={ { opacity: 1, y: 0 } }
							transition={ { duration: 0.7, delay: 0.2 } }
						>
							{ wooPaymentsRecentlyActivated && (
								<InstallWooPaymentsStep
									isStepComplete={ true }
								/>
							) }
							{ sortedSteps.map( ( step ) => {
								return (
									<SidebarNavigationItem
										key={ step.id }
										className={ clsx( step.id, {
											active: currentStep?.id === step.id,
											'payment-step': true,
											'payment-step--active':
												currentStep?.id === step.id,
											'payment-step--disabled':
												currentStep?.id !== step.id,
											'is-complete':
												isStepCompleted( step ),
										} ) }
										icon={
											isStepCompleted( step )
												? taskCompleteIcon
												: taskIcons.activePaymentStep
										}
										disabled={ true }
										showChevron={ false }
									>
										{ step.label }
									</SidebarNavigationItem>
								);
							} ) }
						</motion.div>
					) }
				</ItemGroup>
			</SidebarContainer>
		</div>
	);
};
