/**
 * External dependencies
 */
import { Slot, Fill } from '@wordpress/components';
import {
	sortFillsByOrder,
	createOrderedChildren,
} from '@poocommerce/components';

export const EXPERIMENTAL_WC_CYS_TRANSITIONAL_PAGE_SECONDARY_BUTTON_SLOT_NAME =
	'customize_your_store_transitional_page_secondary_button';

/**
 * Create a Fill for extensions to add a secondary button to the transitional page.
 *
 * @slotFill WooCYSSecondaryButton
 * @scope poocommerce-admin
 * @example
 * const MyButton = () => (
 * 	<Fill name="__experimental_customize_your_store_transitional_page_secondary_button">
 * 		<Button className="poocommerce-experiments-button-slotfill">
 * 				Slotfill goes in here!
 *    </Button>
 * 	</Fill>
 * );
 *
 * registerPlugin( 'my-extension', {
 * 	render: MyButton,
 * 	scope: 'poocommerce-admin',
 * } );
 * @param {Object} param0
 * @param {Array}  param0.children - Node children.
 * @param {Array}  param0.order    - Node order.
 */
export const WooCYSSecondaryButton = ( {
	children,
	order = 1,
}: {
	children?: React.ReactNode;
	order?: number;
} ) => {
	return (
		<Fill
			name={
				EXPERIMENTAL_WC_CYS_TRANSITIONAL_PAGE_SECONDARY_BUTTON_SLOT_NAME
			}
		>
			{ ( fillProps ) => {
				return createOrderedChildren( children, order, fillProps );
			} }
		</Fill>
	);
};

WooCYSSecondaryButton.Slot = ( {
	fillProps,
}: {
	fillProps?: React.ComponentProps< typeof Slot >[ 'fillProps' ];
} ) => (
	<Slot
		name={
			EXPERIMENTAL_WC_CYS_TRANSITIONAL_PAGE_SECONDARY_BUTTON_SLOT_NAME
		}
		fillProps={ fillProps }
	>
		{ sortFillsByOrder }
	</Slot>
);
