/**
 * Internal dependencies
 */
import {
	getUrlParams,
	getTimeFrame,
	createDeprecatedObjectProxy,
} from '../index';

describe( 'getUrlParams', () => {
	let locationSearch = '?param1=text1&param2=text2';

	test( 'should return an object with sent params', () => {
		const { param1, param2 } = getUrlParams( locationSearch );
		expect( param1 ).toEqual( 'text1' );
		expect( param2 ).toEqual( 'text2' );
	} );

	test( 'should return an object with 2 keys/params', () => {
		const params = getUrlParams( locationSearch );
		expect( Object.keys( params ).length ).toEqual( 2 );
	} );

	test( 'should return an empty object', () => {
		locationSearch = '';
		const params = getUrlParams( locationSearch );
		expect( Object.keys( params ).length ).toEqual( 0 );
	} );

	test( 'should return an object with key "no_value" equal to "undefined"', () => {
		locationSearch = 'no_value';
		const { no_value: noValue } = getUrlParams( locationSearch );
		expect( noValue ).toBeUndefined();
	} );
} );

describe( 'getTimeFrame', () => {
	test.each( [
		{
			timeInMs: 1000,
			expected: '0-2s',
		},
		{
			timeInMs: 3000,
			expected: '2-5s',
		},
		{
			timeInMs: 100000,
			expected: '>60s',
		},
	] )(
		'should return time frames $expected when given $timeInMs',
		( { timeInMs, expected } ) => {
			expect( getTimeFrame( timeInMs ) ).toEqual( expected );
		}
	);
} );

describe( 'createDeprecatedObjectProxy', () => {
	let consoleWarnSpy;
	let wcSettings;
	let proxiedSettings;

	beforeEach( () => {
		consoleWarnSpy = jest
			.spyOn( console, 'warn' )
			.mockImplementation( () => {} );

		wcSettings = {
			admin: {
				onboarding: {
					profile: {
						name: 'hello',
						arr: [ 'one', 'two', 'three' ],
					},
				},
			},
		};

		proxiedSettings = createDeprecatedObjectProxy( wcSettings, {
			admin: {
				onboarding: {
					profile:
						'Deprecated: wcSettings.admin.onboarding.profile is deprecated. It is planned to be released in PooCommerce 10.0.0. Please use `getProfileItems` from the onboarding store. See https://github.com/poocommerce/poocommerce/tree/trunk/packages/js/data/src/onboarding for more information.',
				},
			},
		} );
	} );

	afterEach( () => {
		consoleWarnSpy.mockRestore();
	} );

	it( 'should log a warning when accessing a deprecated property', () => {
		expect( consoleWarnSpy ).not.toHaveBeenCalled();
		expect( proxiedSettings.admin.onboarding.profile.name ).toBe( 'hello' );
		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'Deprecated: wcSettings.admin.onboarding.profile is deprecated. It is planned to be released in PooCommerce 10.0.0. Please use `getProfileItems` from the onboarding store. See https://github.com/poocommerce/poocommerce/tree/trunk/packages/js/data/src/onboarding for more information.'
		);
	} );

	it( 'should not log a warning when accessing a non-deprecated property', () => {
		expect( proxiedSettings.admin ).toBeDefined();
		expect( consoleWarnSpy ).not.toHaveBeenCalled();
	} );

	it( 'should retain array prototype methods', () => {
		expect( proxiedSettings.admin.onboarding.profile.arr.length ).toEqual(
			3
		);

		// Array destructuring.
		const copiedArray = [ ...proxiedSettings.admin.onboarding.profile.arr ];
		expect( copiedArray.length ).toEqual( 3 );

		// Array method forEach.
		proxiedSettings.admin.onboarding.profile.arr.forEach( ( item ) => {
			expect( copiedArray.includes( item ) ).toBe( true );
		} );

		// Array method push.
		proxiedSettings.admin.onboarding.profile.arr.push( 'four' );
		expect( proxiedSettings.admin.onboarding.profile.arr.length ).toEqual(
			4
		);
	} );

	it( 'should log a warning when accessing a deprecated array', () => {
		expect( consoleWarnSpy ).not.toHaveBeenCalled();
		expect( proxiedSettings.admin.onboarding.profile.arr.length ).toEqual(
			3
		);
		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'Deprecated: wcSettings.admin.onboarding.profile is deprecated. It is planned to be released in PooCommerce 10.0.0. Please use `getProfileItems` from the onboarding store. See https://github.com/poocommerce/poocommerce/tree/trunk/packages/js/data/src/onboarding for more information.'
		);
	} );
} );
