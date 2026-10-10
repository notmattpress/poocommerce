/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import './style.scss';
import { SiteVisibilityTour } from '../tour';
import { useSiteVisibilityTour } from '../tour/use-site-visibility-tour';

export const LaunchYourStoreStatus = () => {
	const { showTour, setShowTour, onClose, shouldTourBeShown } =
		useSiteVisibilityTour();

	return (
		<div className="poocommerce-lys-status">
			{ shouldTourBeShown && showTour && (
				<SiteVisibilityTour
					onClose={ () => {
						onClose();
						setShowTour( false );
					} }
				/>
			) }
		</div>
	);
};
