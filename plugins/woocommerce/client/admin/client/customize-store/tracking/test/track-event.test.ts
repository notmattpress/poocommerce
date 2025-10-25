/**
 * External dependencies
 */
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { trackEvent } from '..';
import { isWooExpress } from '~/utils/is-woo-express';
import { isEntrepreneurFlow } from '~/customize-store/entrepreneur-flow';

jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

jest.mock( '~/utils/is-woo-express', () => ( {
	isWooExpress: jest.fn().mockReturnValue( false ),
} ) );

jest.mock( '~/customize-store/entrepreneur-flow', () => {
	const originalModule = jest.requireActual(
		'~/customize-store/entrepreneur-flow'
	);
	return {
		...originalModule,
		isEntrepreneurFlow: jest.fn().mockReturnValue( false ),
	};
} );

describe( 'recordEvent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should invoke recordEvent without additional parameter - no Woo Express env', async () => {
		trackEvent( 'test_event', {
			key: 'value',
		} );

		expect( recordEvent ).toBeCalledWith( 'test_event', {
			key: 'value',
		} );
	} );

	it( 'should invoke recordEvent without additional parameter - Woo Express env', async () => {
		( isWooExpress as jest.Mock ).mockReturnValue( true );

		trackEvent( 'test_event', {
			key: 'value',
		} );

		expect( recordEvent ).toBeCalledWith( 'test_event', {
			key: 'value',
		} );
	} );

	it( 'should invoke recordEvent with additional parameter', async () => {
		( isWooExpress as jest.Mock ).mockReturnValue( true );
		( isEntrepreneurFlow as jest.Mock ).mockReturnValue( true );
		trackEvent( 'test_event', {
			key: 'value',
		} );

		expect( recordEvent ).toBeCalledWith( 'test_event', {
			key: 'value',
			ref: 'entrepreneur-signup',
		} );
	} );
} );
