/**
 * External dependencies
 */
import { Slot, Fill } from '@wordpress/components';
import {
	createOrderedChildren,
	sortFillsByOrder,
} from '@poocommerce/components';

export const EXPERIMENTAL_WC_TASKLIST_FOOTER_SLOT_NAME =
	'experimental_poocommerce_tasklist_footer_item';
/**
 * Create a Fill for extensions to add items to the PooCommerce Admin Task List footer.
 *
 * @slotFill ExperimentalWooTaskListFooterItem
 * @scope poocommerce-admin
 * @example
 * const MyFooterItem = () => (
 * 	<Fill name="experimental_poocommerce_tasklist_footer_item">
 * 		<div className="poocommerce-experiments-placeholder-slotfill">
 * 			<div className="placeholder-slotfill-content">
 * 				Slotfill goes in here!
 * 			</div>
 * 		</div>
 * 	</Fill>
  );
 *
 * registerPlugin( 'my-extension', {
 * render: MyFooterItem,
 * scope: 'poocommerce-admin',
 * } );
 * @param {Object} param0
 * @param {Array}  param0.children - Node children.
 * @param {Array}  param0.order    - Node order.
 */
export const ExperimentalWooTaskListFooterItem = ( {
	children,
	order = 1,
}: {
	children: React.ReactNode;
	order?: number;
} ) => {
	return (
		<Fill name={ EXPERIMENTAL_WC_TASKLIST_FOOTER_SLOT_NAME }>
			{ ( fillProps: Fill.Props ) => {
				return createOrderedChildren( children, order, fillProps );
			} }
		</Fill>
	);
};

ExperimentalWooTaskListFooterItem.Slot = ( {
	fillProps,
}: {
	fillProps?: Slot.Props;
} ) => (
	<Slot
		name={ EXPERIMENTAL_WC_TASKLIST_FOOTER_SLOT_NAME }
		fillProps={ fillProps }
	>
		{ sortFillsByOrder }
	</Slot>
);
