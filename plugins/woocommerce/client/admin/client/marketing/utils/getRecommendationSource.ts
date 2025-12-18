/**
 * Internal dependencies
 */
import { getAdminSetting } from '~/utils/admin-settings';

/**
 * Get the source of the marketing recommendations.
 *
 * When the marketplace suggestions feature is turned on, the source is 'poocommerce.com'. Otherwise, it is 'plugin-poocommerce'.
 */
export const getRecommendationSource = () => {
	if ( getAdminSetting( 'allowMarketplaceSuggestions', false ) ) {
		return 'poocommerce.com';
	}

	return 'plugin-poocommerce';
};
