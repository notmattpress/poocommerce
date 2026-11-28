/**
 * External dependencies
 */
import { mockBrowserLocation } from '@poocommerce/internal-js-tests';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskType } from '@poocommerce/data';
import { useDispatch, useSelect } from '@wordpress/data';
import { recordEvent } from '@poocommerce/tracks';
import { setLocaleData, resetLocaleData } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Tax } from '..';

const setHref = mockBrowserLocation( 'href' );

jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	useSelect: jest.fn(),
	useDispatch: jest.fn(),
} ) );

jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

jest.mock( '~/utils/features', () => ( {
	isFeatureEnabled: jest.fn(),
} ) );

const fakeTask: {
	additionalData: {
		[ key: string ]: boolean | string | string[];
	};
} = {
	additionalData: {},
};

beforeEach( () => {
	fakeTask.additionalData = {
		poocommerceTaxCountries: [ 'US' ],
	};

	( useSelect as jest.Mock ).mockReturnValue( {
		generalSettings: {
			poocommerce_default_country: 'US',
		},
	} );
	( useDispatch as jest.Mock ).mockReturnValue( {
		updateAndPersistSettingsForGroup: jest.fn().mockResolvedValue( {} ),
		createNotice: jest.fn(),
	} );
} );

afterEach( () => {
	resetLocaleData( {}, 'poocommerce' );
} );

const assertPooCommerceTaxIsNotRecommended = () => {
	expect(
		screen.queryByText( 'Choose a tax partner' )
	).not.toBeInTheDocument();

	expect(
		screen.getByText(
			'Head over to the tax rate settings screen to configure your tax rates'
		)
	).toBeInTheDocument();
};

it.each( [ 'Yes please', 'نعم من فضلك 日本語 🛒' ] )(
	'requires a click to enable automated taxes with button text %s',
	async ( buttonText ) => {
		setLocaleData( { 'Yes please': [ buttonText ] }, 'poocommerce' );
		const updateSettings = jest.fn().mockResolvedValue( {} );
		const onComplete = jest.fn();
		( useSelect as jest.Mock ).mockReturnValue( {
			generalSettings: {
				poocommerce_default_country: 'US',
				poocommerce_store_address: 'Žltá ulica 123 العربية 日本語 🛒',
				poocommerce_store_postcode: '90210',
			},
			isJetpackConnected: true,
			pluginsToActivate: [],
		} );
		( useDispatch as jest.Mock ).mockReturnValue( {
			updateAndPersistSettingsForGroup: updateSettings,
			createNotice: jest.fn(),
		} );

		render(
			<Tax
				onComplete={ onComplete }
				query={ { auto: 'true', partner: 'poocommerce-tax' } }
				task={ fakeTask as TaskType }
			/>
		);

		expect( updateSettings ).not.toHaveBeenCalled();
		fireEvent.click( screen.getByRole( 'button', { name: buttonText } ) );
		await waitFor( () => expect( onComplete ).toHaveBeenCalledTimes( 1 ) );
		expect( updateSettings ).toHaveBeenCalledTimes( 2 );
		expect( updateSettings ).toHaveBeenCalledWith( 'general', {
			general: expect.objectContaining( {
				poocommerce_calc_taxes: 'yes',
			} ),
		} );
		expect( updateSettings ).toHaveBeenCalledWith( 'tax', {
			tax: { wc_connect_taxes_enabled: 'yes' },
		} );
	}
);

it( 'renders PooCommerce Tax (powered by WCS&T)', () => {
	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	expect( screen.getByText( 'Choose a tax partner' ) ).toBeInTheDocument();
} );

it( `does not render PooCommerce Tax (powered by WCS&T) if the PooCommerce Tax plugin is active`, () => {
	fakeTask.additionalData.poocommerceTaxActivated = true;

	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	assertPooCommerceTaxIsNotRecommended();
} );

it( `does not render PooCommerce Tax (powered by WCS&T) if the PooCommerce Shipping plugin is active`, () => {
	fakeTask.additionalData.poocommerceShippingActivated = true;

	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	assertPooCommerceTaxIsNotRecommended();
} );

it( `does not render PooCommerce Tax (powered by WCS&T) if the TaxJar plugin is active`, () => {
	fakeTask.additionalData.taxJarActivated = true;

	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	assertPooCommerceTaxIsNotRecommended();
} );

it( 'does not render PooCommerce Tax (powered by WCS&T) if not in a supported country', () => {
	( useSelect as jest.Mock ).mockReturnValue( {
		generalSettings: { poocommerce_default_country: 'FOO' },
	} );

	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	assertPooCommerceTaxIsNotRecommended();
} );

it( 'should trigger event tasklist_tax_visit_marketplace_click when clicking the PooCommerce Marketplace link', () => {
	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	fireEvent.click( screen.getByText( 'the PooCommerce Marketplace' ) );

	expect( recordEvent ).toHaveBeenCalledWith(
		'tasklist_tax_visit_marketplace_click',
		{}
	);
} );

it( 'should navigate to the marketplace when clicking the PooCommerce Marketplace link', async () => {
	const { isFeatureEnabled } = jest.requireMock( '~/utils/features' );
	( isFeatureEnabled as jest.Mock ).mockReturnValue( true );

	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	fireEvent.click( screen.getByText( 'the PooCommerce Marketplace' ) );

	expect( setHref ).toHaveBeenCalledWith(
		expect.stringContaining(
			'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=operations'
		)
	);
} );
