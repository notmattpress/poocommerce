/**
 * External dependencies
 */
import { recordEvent } from '@poocommerce/tracks';
import { render, fireEvent } from '@testing-library/react';
import {
	PaymentsExtensionSuggestionProvider,
	PluginData,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { PaymentExtensionSuggestionListItem } from '..';

jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

describe( 'PaymentExtensionSuggestionListItem', () => {
	it( 'should record settings_payments_provider_enable_click event on click of the Enable button', () => {
		const { getByRole } = render(
			<PaymentExtensionSuggestionListItem
				suggestion={
					{
						id: 'test-suggestion',
						title: 'Test Suggestion',
						description: 'Test Suggestion Description',
						icon: 'test-suggestion-icon',
						image: 'test-suggestion-image',
						short_description: 'Test Suggestion Short Description',
						tags: [],
						plugin: {
							slug: 'test-suggestion-plugin',
							file: 'test-suggestion-file',
							status: 'installed',
						} as PluginData,
						_order: 1,
						_type: 'suggestion',
					} as unknown as PaymentsExtensionSuggestionProvider
				}
				installingPlugin={ null }
				setUpPlugin={ () => {} }
				pluginInstalled={ true }
				acceptIncentive={ () => {} }
				shouldHighlightIncentive={ false }
			/>
		);

		fireEvent.click( getByRole( 'button', { name: 'Enable' } ) );
		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_provider_enable_click',
			expect.objectContaining( {
				provider_id: 'test-suggestion',
				suggestion_id: 'test-suggestion',
			} )
		);
	} );
} );
