/**
 * External dependencies
 */
import { recordEvent } from '@poocommerce/tracks';
import { render, fireEvent } from '@testing-library/react';
import {
	PaymentsProviderIncentive,
	PaymentsProvider,
	PaymentsProviderType,
	PluginData,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { IncentiveModal } from '..';

jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

const testIncentive: PaymentsProviderIncentive = {
	id: 'test-incentive',
	description: 'Test Incentive',
	promo_id: 'test-promo-id',
	title: 'Test Title',
	short_description: 'Test Short Description',
	cta_label: 'Test CTA Label',
	tc_url: 'https://example.com',
	badge: 'test-badge',
	_dismissals: [],
	_links: {
		dismiss: {
			href: 'https://example.com',
		},
	},
};

const testProvider: PaymentsProvider = {
	id: 'test-provider',
	_order: 1,
	_type: PaymentsProviderType.Gateway, // or any valid PaymentsProviderType
	title: 'Test Title',
	description: 'Test Description',
	icon: 'test-icon',
	plugin: {
		id: 'test-plugin',
		name: 'Test Plugin',
		description: 'Test Plugin Description',
		pluginUrl: 'https://example.com',
		slug: 'test-plugin-slug',
		file: 'test-plugin-file',
		status: 'active',
	} as PluginData,
	_links: {},
	_suggestion_id: 'test-suggestion-id',
};

describe( 'IncentiveModal', () => {
	it( 'should record settings_payments_incentive_show event when the incentive is shown', () => {
		render(
			<IncentiveModal
				incentive={ testIncentive }
				provider={ testProvider }
				onboardingUrl="https://example.com"
				onAccept={ jest.fn() }
				onDismiss={ jest.fn() }
				setUpPlugin={ jest.fn() }
			/>
		);

		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_incentive_show',
			expect.objectContaining( {
				business_country: expect.any( String ),
				display_context: 'wc_settings_payments__modal',
				incentive_id: 'test-promo-id',
				provider_id: 'test-provider',
				suggestion_id: 'test-suggestion-id',
			} )
		);
	} );

	it( 'should record settings_payments_incentive_accept event when the accept button is clicked', () => {
		const onAccept = jest.fn();
		const { getByRole } = render(
			<IncentiveModal
				incentive={ testIncentive }
				provider={ testProvider }
				onboardingUrl="https://example.com"
				onAccept={ onAccept }
				onDismiss={ jest.fn() }
				setUpPlugin={ jest.fn() }
			/>
		);

		fireEvent.click( getByRole( 'button', { name: 'Test CTA Label' } ) );

		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_incentive_accept',
			expect.objectContaining( {
				business_country: expect.any( String ),
				display_context: 'wc_settings_payments__modal',
				incentive_id: 'test-promo-id',
				provider_id: 'test-provider',
				suggestion_id: 'test-suggestion-id',
			} )
		);
	} );
} );
