/**
 * External dependencies
 */
import { Spinner } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import './CenteredSpinner.scss';

export const CenteredSpinner = () => {
	return (
		<div className="poocommerce-centered-spinner">
			<Spinner />
		</div>
	);
};
