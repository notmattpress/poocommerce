/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { OrderStatus } from '@poocommerce/components';

const orderStatusMap = {
	processing: __( 'Processing Order', 'poocommerce' ),
	pending: __( 'Pending Order', 'poocommerce' ),
	completed: __( 'Completed Order', 'poocommerce' ),
};

export const Basic = () => (
	<div>
		<OrderStatus
			order={ { status: 'processing' } }
			orderStatusMap={ orderStatusMap }
		/>
		<OrderStatus
			order={ { status: 'pending' } }
			orderStatusMap={ orderStatusMap }
		/>
		<OrderStatus
			order={ { status: 'completed' } }
			orderStatusMap={ orderStatusMap }
		/>
	</div>
);

export default {
	title: 'Components/OrderStatus',
	component: OrderStatus,
};
