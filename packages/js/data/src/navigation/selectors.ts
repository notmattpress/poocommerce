/**
 * External dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { NavigationState } from './types';

const MENU_ITEMS_HOOK = 'poocommerce_navigation_menu_items' as const;

export const getMenuItems = ( state: NavigationState ) => {
	/**
	 * Navigation Menu Items.
	 *
	 * @filter poocommerce_navigation_menu_items
	 * @param {Array.<Object>} menuItems Array of Navigation menu items.
	 */
	return applyFilters( MENU_ITEMS_HOOK, state.menuItems );
};

export const getFavorites = ( state: NavigationState ) => {
	return state.favorites || [];
};

export const isNavigationRequesting = (
	state: NavigationState,
	selector: string
) => {
	return state.requesting[ selector ] || false;
};

export const getPersistedQuery = ( state: NavigationState ) => {
	return state.persistedQuery || {};
};
