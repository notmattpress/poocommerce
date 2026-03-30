/**
 * External dependencies
 */
import { render, screen, waitFor } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import PooCommerceShippingItem from '../experimental-poocommerce-shipping-item';
jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	useDispatch: jest.fn(),
} ) );
jest.mock( '@poocommerce/tracks', () => ( {
	...jest.requireActual( '@poocommerce/tracks' ),
	recordEvent: jest.fn(),
} ) );

jest.mock( '@poocommerce/admin-layout', () => {
	const mockContext = {
		layoutPath: [ 'root' ],
		layoutString: 'root',
		extendLayout: () => {},
		isDescendantOf: () => false,
	};
	return {
		...jest.requireActual( '@poocommerce/admin-layout' ),
		useLayoutContext: jest.fn().mockReturnValue( mockContext ),
		useExtendLayout: jest.fn().mockReturnValue( mockContext ),
	};
} );

describe( 'PooCommerceShippingItem', () => {
	const defaultProps = {
		pluginsBeingSetup: [] as string[],
		onInstallClick: jest.fn( () => Promise.resolve() ),
		onActivateClick: jest.fn( () => Promise.resolve() ),
	};

	beforeEach( () => {
		( useDispatch as jest.Mock ).mockReturnValue( {
			createSuccessNotice: jest.fn(),
		} );
	} );

	it( 'should render WC Shipping item with CTA = "Install" when WC Shipping is not installed', () => {
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ false }
				{ ...defaultProps }
			/>
		);

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).toBeInTheDocument();

		expect(
			screen.queryByRole( 'button', { name: 'Install' } )
		).toBeInTheDocument();
	} );

	it( 'should render WC Shipping item with CTA = "Activate" when WC Shipping is installed', () => {
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ true }
				{ ...defaultProps }
			/>
		);

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).toBeInTheDocument();

		expect(
			screen.queryByRole( 'button', { name: 'Activate' } )
		).toBeInTheDocument();
	} );

	it( 'should call onInstallClick when clicking Install button', () => {
		const onInstallClick = jest.fn( () => Promise.resolve() );
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ false }
				pluginsBeingSetup={ [] }
				onInstallClick={ onInstallClick }
				onActivateClick={ jest.fn( () => Promise.resolve() ) }
			/>
		);

		screen.queryByRole( 'button', { name: 'Install' } )?.click();
		expect( onInstallClick ).toHaveBeenCalledWith( [
			'poocommerce-shipping',
		] );
	} );

	it( 'should record shipping_partner_click when clicking Install button', () => {
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ false }
				{ ...defaultProps }
				tracking={ {
					context: 'settings',
					country: 'US',
					plugins: 'poocommerce-shipping',
				} }
			/>
		);

		screen.queryByRole( 'button', { name: 'Install' } )?.click();
		expect( recordEvent ).toHaveBeenCalledWith( 'shipping_partner_click', {
			context: 'settings',
			country: 'US',
			plugins: 'poocommerce-shipping',
			selected_plugin: 'poocommerce-shipping',
		} );
	} );

	it( 'should record shipping_partner_click when clicking Activate button', () => {
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ true }
				{ ...defaultProps }
				tracking={ {
					context: 'settings',
					country: 'US',
					plugins: 'poocommerce-shipping',
				} }
			/>
		);

		screen.queryByRole( 'button', { name: 'Activate' } )?.click();
		expect( recordEvent ).toHaveBeenCalledWith( 'shipping_partner_click', {
			context: 'settings',
			country: 'US',
			plugins: 'poocommerce-shipping',
			selected_plugin: 'poocommerce-shipping',
		} );
	} );

	it( 'should record settings_shipping_recommendation_setup_click with action=install when clicking Install button', () => {
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ false }
				{ ...defaultProps }
			/>
		);

		screen.queryByRole( 'button', { name: 'Install' } )?.click();
		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_shipping_recommendation_setup_click',
			{
				plugin: 'poocommerce-shipping',
				action: 'install',
			}
		);
	} );

	it( 'should record settings_shipping_recommendation_setup_click with action=activate when clicking Activate button', () => {
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ true }
				{ ...defaultProps }
			/>
		);

		screen.queryByRole( 'button', { name: 'Activate' } )?.click();
		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_shipping_recommendation_setup_click',
			{
				plugin: 'poocommerce-shipping',
				action: 'activate',
			}
		);
	} );

	it( 'should call onActivateClick when clicking Activate button', () => {
		const onActivateClick = jest.fn( () => Promise.resolve() );
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ true }
				pluginsBeingSetup={ [] }
				onInstallClick={ jest.fn( () => Promise.resolve() ) }
				onActivateClick={ onActivateClick }
			/>
		);

		screen.queryByRole( 'button', { name: 'Activate' } )?.click();
		expect( onActivateClick ).toHaveBeenCalledWith( [
			'poocommerce-shipping',
		] );
	} );

	it( 'should record shipping_partner_install with success on successful install', async () => {
		const tracking = {
			context: 'settings' as const,
			country: 'US',
			plugins: 'poocommerce-shipping',
		};
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ false }
				{ ...defaultProps }
				onInstallClick={ jest.fn( () => Promise.resolve() ) }
				tracking={ tracking }
			/>
		);

		screen.queryByRole( 'button', { name: 'Install' } )?.click();

		await waitFor( () => {
			expect( recordEvent ).toHaveBeenCalledWith(
				'shipping_partner_install',
				{
					context: 'settings',
					country: 'US',
					plugins: 'poocommerce-shipping',
					selected_plugin: 'poocommerce-shipping',
					success: true,
				}
			);
		} );
	} );

	it( 'should record shipping_partner_install with failure on failed install', async () => {
		const tracking = {
			context: 'settings' as const,
			country: 'US',
			plugins: 'poocommerce-shipping',
		};
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ false }
				{ ...defaultProps }
				onInstallClick={ jest.fn( () => Promise.reject() ) }
				tracking={ tracking }
			/>
		);

		screen.queryByRole( 'button', { name: 'Install' } )?.click();

		await waitFor( () => {
			expect( recordEvent ).toHaveBeenCalledWith(
				'shipping_partner_install',
				{
					context: 'settings',
					country: 'US',
					plugins: 'poocommerce-shipping',
					selected_plugin: 'poocommerce-shipping',
					success: false,
				}
			);
		} );
	} );

	it( 'should record shipping_partner_activate with success on successful activation', async () => {
		const tracking = {
			context: 'settings' as const,
			country: 'US',
			plugins: 'poocommerce-shipping',
		};
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ true }
				{ ...defaultProps }
				onActivateClick={ jest.fn( () => Promise.resolve() ) }
				tracking={ tracking }
			/>
		);

		screen.queryByRole( 'button', { name: 'Activate' } )?.click();

		await waitFor( () => {
			expect( recordEvent ).toHaveBeenCalledWith(
				'shipping_partner_activate',
				{
					context: 'settings',
					country: 'US',
					plugins: 'poocommerce-shipping',
					selected_plugin: 'poocommerce-shipping',
					success: true,
				}
			);
		} );
	} );

	it( 'should record shipping_partner_activate with failure on failed activation', async () => {
		const tracking = {
			context: 'settings' as const,
			country: 'US',
			plugins: 'poocommerce-shipping',
		};
		render(
			<PooCommerceShippingItem
				isPluginInstalled={ true }
				{ ...defaultProps }
				onActivateClick={ jest.fn( () => Promise.reject() ) }
				tracking={ tracking }
			/>
		);

		screen.queryByRole( 'button', { name: 'Activate' } )?.click();

		await waitFor( () => {
			expect( recordEvent ).toHaveBeenCalledWith(
				'shipping_partner_activate',
				{
					context: 'settings',
					country: 'US',
					plugins: 'poocommerce-shipping',
					selected_plugin: 'poocommerce-shipping',
					success: false,
				}
			);
		} );
	} );
} );
