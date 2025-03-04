/**
 * Internal dependencies
 */
import './CardHeaderDescription.scss';

export const CardHeaderDescription: React.FC< React.PropsWithChildren > = ( {
	children,
} ) => {
	return (
		<div className="poocommerce-marketing-card-header-description">
			{ children }
		</div>
	);
};
