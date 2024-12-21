/**
 * Internal dependencies
 */
import './CardHeaderDescription.scss';

export const CardHeaderDescription: React.FC = ( { children } ) => {
	return (
		<div className="poocommerce-marketing-card-header-description">
			{ children }
		</div>
	);
};
