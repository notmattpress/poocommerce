/**
 * External dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';

jest.mock( '@wordpress/blocks', () => ( {
	getBlockTypes: jest.fn(),
	unregisterBlockType: jest.fn(),
} ) );

jest.mock( '@wordpress/dom-ready', () => ( {
	__esModule: true,
	default: jest.fn( ( callback ) => callback() ),
} ) );

const loadFilter = (
	adminPage: string | undefined,
	blockTypes: string[],
	pageNow?: string
) => {
	const wordpressWindow = window as Window & {
		adminpage?: string;
		pagenow?: string;
	};
	wordpressWindow.adminpage = adminPage;
	wordpressWindow.pagenow = pageNow;
	( getBlockTypes as jest.Mock ).mockReturnValue(
		blockTypes.map( ( name ) => ( { name } ) )
	);

	jest.isolateModules( () => {
		require( '../index' );
	} );
};

describe( 'unregister block types', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [ 'post-php', 'post-new-php' ] )(
		'unregisters only post-editor block types in the deny list in %s',
		( adminPage ) => {
			loadFilter( adminPage, [
				'poocommerce/breadcrumbs',
				'poocommerce/product-reviews',
				'poocommerce/product-search',
				'myplugin/client-only',
			] );

			expect( unregisterBlockType ).toHaveBeenCalledTimes( 2 );
			expect( unregisterBlockType ).toHaveBeenCalledWith(
				'poocommerce/breadcrumbs'
			);
			expect( unregisterBlockType ).toHaveBeenCalledWith(
				'poocommerce/product-reviews'
			);
			expect( unregisterBlockType ).not.toHaveBeenCalledWith(
				'poocommerce/product-search'
			);
			expect( unregisterBlockType ).not.toHaveBeenCalledWith(
				'myplugin/client-only'
			);
		}
	);

	it.each( [
		[ 'widgets.php', 'widgets-php', undefined ],
		[ 'the Customizer', undefined, 'customize' ],
	] )(
		'unregisters PooCommerce blocks outside the widget-editor allow list in %s',
		( _context, adminPage, pageNow ) => {
			loadFilter(
				adminPage,
				[
					'poocommerce/product-search',
					'poocommerce/product-filters',
					'poocommerce/checkout',
					'poocommerce/order-confirmation-status',
					'poocommerce/new-widget-compatible-block',
					'myplugin/client-only',
				],
				pageNow
			);

			expect( unregisterBlockType ).toHaveBeenCalledTimes( 3 );
			expect( unregisterBlockType ).toHaveBeenCalledWith(
				'poocommerce/checkout'
			);
			expect( unregisterBlockType ).toHaveBeenCalledWith(
				'poocommerce/order-confirmation-status'
			);
			expect( unregisterBlockType ).not.toHaveBeenCalledWith(
				'poocommerce/product-search'
			);
			expect( unregisterBlockType ).not.toHaveBeenCalledWith(
				'poocommerce/product-filters'
			);
			expect( unregisterBlockType ).toHaveBeenCalledWith(
				'poocommerce/new-widget-compatible-block'
			);
			expect( unregisterBlockType ).not.toHaveBeenCalledWith(
				'myplugin/client-only'
			);
		}
	);

	it.each( [ 'site-editor-php', undefined ] )(
		'does not unregister blocks in unrestricted editor contexts (%s)',
		( adminPage ) => {
			loadFilter( adminPage, [
				'poocommerce/breadcrumbs',
				'poocommerce/checkout',
				'myplugin/client-only',
			] );

			expect( unregisterBlockType ).not.toHaveBeenCalled();
		}
	);
} );
