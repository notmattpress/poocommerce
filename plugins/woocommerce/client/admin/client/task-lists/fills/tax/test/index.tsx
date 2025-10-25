/**
 * External dependencies
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskType } from '@poocommerce/data';
import { useSelect } from '@wordpress/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { Tax } from '..';

jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	useSelect: jest.fn(),
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

	( useSelect as jest.Mock ).mockImplementation( () => ( {
		generalSettings: {
			poocommerce_default_country: 'US',
		},
	} ) );
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

	const mockLocation = {
		href: 'test',
	} as Location;

	mockLocation.href = 'test';
	Object.defineProperty( global.window, 'location', {
		value: mockLocation,
	} );

	render(
		<Tax
			onComplete={ () => {} }
			query={ {} }
			task={ fakeTask as TaskType }
		/>
	);

	fireEvent.click( screen.getByText( 'the PooCommerce Marketplace' ) );

	expect( mockLocation.href ).toContain(
		'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=operations'
	);
} );
