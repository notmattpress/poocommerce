/**
 * Internal dependencies
 */
import { getAdminSetting } from '~/utils/admin-settings';
import { getRecommendationSource } from './getRecommendationSource';

jest.mock( '~/utils/admin-settings', () => ( {
	getAdminSetting: jest.fn(),
} ) );

describe( 'getRecommendationSource', () => {
	it( 'should return "poocommerce.com" when marketplace suggestions feature is turned on', () => {
		( getAdminSetting as jest.Mock ).mockReturnValue( true );

		const source = getRecommendationSource();

		expect( getAdminSetting ).toHaveBeenCalledWith(
			'allowMarketplaceSuggestions',
			false
		);
		expect( source ).toBe( 'poocommerce.com' );
	} );

	it( 'should return "plugin-poocommerce" when marketplace suggestions feature is turned off', () => {
		( getAdminSetting as jest.Mock ).mockReturnValue( false );

		const source = getRecommendationSource();

		expect( getAdminSetting ).toHaveBeenCalledWith(
			'allowMarketplaceSuggestions',
			false
		);
		expect( source ).toBe( 'plugin-poocommerce' );
	} );
} );
