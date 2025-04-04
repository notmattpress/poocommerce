/**
 * External dependencies
 */
import { createElement, useEffect } from '@wordpress/element';
import { recordEvent } from '@poocommerce/tracks';
import { Slot, Fill } from '@wordpress/components';

/**
 * Internal dependencies
 *
 * @param {string} taskId  Task id.
 * @param {string} variant The variant of the task.
 */
export const trackView = async ( taskId: string, variant?: string ) => {
	const activePlugins: string[] = wp.data
		.select( 'wc/admin/plugins' )
		.getActivePlugins();

	const installedPlugins: string[] = wp.data
		.select( 'wc/admin/plugins' )
		.getInstalledPlugins();

	const isJetpackConnected: boolean =
		wp.data.select( 'wc/admin/plugins' ).isJetpackConnected() || false;

	recordEvent( 'task_view', {
		task_name: taskId,
		variant,
		wcs_installed: installedPlugins.includes( 'poocommerce-services' ),
		wcs_active: activePlugins.includes( 'poocommerce-services' ),
		jetpack_installed: installedPlugins.includes( 'jetpack' ),
		jetpack_active: activePlugins.includes( 'jetpack' ),
		jetpack_connected: isJetpackConnected,
	} );
};

type WooOnboardingTaskProps = {
	id: string;
	children: React.ComponentProps< typeof Fill >[ 'children' ];
	variant?: string;
};

type WooOnboardingTaskSlotProps = {
	id: string;
	fillProps: React.ComponentProps< typeof Slot >[ 'fillProps' ];
};

/**
 * A Fill for adding Onboarding tasks.
 *
 * @slotFill WooOnboardingTask
 * @scope poocommerce-tasks
 * @param {Object} props           React props.
 * @param {string} [props.variant] The variant of the task.
 * @param {Object} props.children  React component children
 * @param {string} props.id        Task id.
 */
const WooOnboardingTask = ( { id, ...props }: WooOnboardingTaskProps ) => {
	return <Fill name={ 'poocommerce_onboarding_task_' + id } { ...props } />;
};

WooOnboardingTask.Slot = ( { id, fillProps }: WooOnboardingTaskSlotProps ) => {
	// The Slot is a React component and this hook works as expected.
	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect( () => {
		trackView( id );
	}, [ id ] );

	return (
		<Slot
			name={ 'poocommerce_onboarding_task_' + id }
			fillProps={ fillProps }
		/>
	);
};

export { WooOnboardingTask };
