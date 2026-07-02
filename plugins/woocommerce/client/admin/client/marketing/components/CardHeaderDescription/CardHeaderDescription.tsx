/**
 * Internal dependencies
 */
import './CardHeaderDescription.scss';

export const CardHeaderDescription = ( {
	children,
}: React.PropsWithChildren ) => {
	return (
		<div className="poocommerce-marketing-card-header-description">
			{ children }
		</div>
	);
};
