/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { Slot, Fill } from '@wordpress/components';

type WooOnboardingTaskListHeaderProps = {
	id: string;
};

/**
 * A Fill for adding Onboarding Task List headers.
 *
 * @slotFill WooOnboardingTaskListHeader
 * @scope poocommerce-tasks
 * @param {Object} props    React props.
 * @param {string} props.id Task id.
 */
export const WooOnboardingTaskListHeader = ( {
	id,
	...props
}: WooOnboardingTaskListHeaderProps & Slot.Props ) => (
	<Fill
		name={ 'poocommerce_onboarding_task_list_header_' + id }
		{ ...props }
	/>
);

WooOnboardingTaskListHeader.Slot = ( {
	id,
	fillProps,
}: WooOnboardingTaskListHeaderProps & Slot.Props ) => (
	<Slot
		name={ 'poocommerce_onboarding_task_list_header_' + id }
		fillProps={ fillProps }
	/>
);
