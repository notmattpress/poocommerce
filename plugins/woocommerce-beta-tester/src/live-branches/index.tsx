/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { App } from './App';

addFilter( 'poocommerce_admin_pages_list', 'live-branches', ( pages ) => {
	pages.push( {
		container: App,
		path: '/live-branches',
		wpOpenMenu: 'toplevel_page_poocommerce',
		capability: 'read',
		breadcrumbs: [ 'Live Branches' ],
		navArgs: { id: 'poocommerce-beta-tester-live-branches' },
	} );

	return pages;
} );
