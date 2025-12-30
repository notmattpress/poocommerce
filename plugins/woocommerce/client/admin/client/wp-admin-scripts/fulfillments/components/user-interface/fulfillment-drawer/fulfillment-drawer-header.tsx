/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import { useFulfillmentDrawerContext } from '../../../context/drawer-context';

export default function FulfillmentsDrawerHeader( {
	onClose,
}: {
	onClose: () => void;
} ) {
	const { order, setIsEditing, setOpenSection } =
		useFulfillmentDrawerContext();
	if ( ! order ) {
		return null;
	}

	return (
		order && (
			<div className={ 'poocommerce-fulfillment-drawer__header' }>
				<div className="poocommerce-fulfillment-drawer__header__title">
					<h2>
						#{ order.id }{ ' ' }
						{ order.billing.first_name +
							' ' +
							order.billing.last_name }
					</h2>
					<button
						className="poocommerce-fulfillment-drawer__header__close-button"
						onClick={ () => {
							setIsEditing( false );
							setOpenSection( 'order' );
							onClose();
						} }
					>
						×
					</button>
				</div>
				<p>
					{ moment( order.date_created ).format(
						'MMMM D, YYYY, H:mma'
					) }
				</p>
			</div>
		)
	);
}
