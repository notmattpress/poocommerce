/**
 * External dependencies
 */
import { recordEvent } from '@poocommerce/tracks';
import { render, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { SettingsButton } from '..';

jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

describe( 'SettingsButton', () => {
	it( 'should record settings_payments_provider_manage_click event on click of the button', () => {
		const { getByRole } = render(
			<SettingsButton gatewayId={ 'test-gateway' } settingsHref={ '' } />
		);
		fireEvent.click( getByRole( 'link', { name: 'Manage' } ) );
		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_provider_manage_click',
			{
				provider_id: 'test-gateway',
			}
		);
	} );
} );
