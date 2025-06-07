/**
 * External dependencies
 */
import { recordEvent } from '@poocommerce/tracks';
import { render } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { SettingsPaymentsMain } from '../settings-payments-main';

jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

describe( 'SettingsPaymentsMain', () => {
	it( 'should record settings_payments_pageview event on load', () => {
		render( <SettingsPaymentsMain /> );

		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_pageview',
			{
				business_country: expect.any( String ),
			}
		);
	} );
} );
