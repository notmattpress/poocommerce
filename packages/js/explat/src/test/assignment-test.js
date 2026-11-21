// Define that tracking is enabled before import
// so that assignments can get the correct value.
global.wcTracks.isEnabled = true;

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	fetchExperimentAssignment,
	fetchExperimentAssignmentWithAuth,
	fetchExperimentAssignmentWithDefaultVariationName,
} from '../assignment';
global.fetch = jest.fn().mockImplementation( () =>
	Promise.resolve( {
		json: () => Promise.resolve( {} ),
		ok: true,
		status: 200,
	} )
);

const fetchMock = jest.spyOn( global, 'fetch' );

describe( 'fetchExperimentAssignment', () => {
	it( 'applies poocommerce_explat_request_args before constructing the full URL', async () => {
		addFilter(
			'poocommerce_explat_request_args',
			'test',
			function ( args ) {
				args.test = 'test';
				return args;
			}
		);

		const fetchPromise = fetchExperimentAssignment( {
			experimentName: '123',
			anonId: 'abc',
		} );

		expect( fetchMock ).toHaveBeenCalledWith(
			'https://public-api.wordpress.com/wpcom/v2/experiments/0.1.0/assignments/poocommerce?experiment_name=123&anon_id=abc&test=test'
		);
		await fetchPromise;
	} );

	it( 'should throw error when anonId is empty', async () => {
		const fetchPromise = fetchExperimentAssignment( {
			experimentName: '123',
			anonId: null,
		} );
		await expect( fetchPromise ).rejects.toThrow();
	} );

	it( 'should throw error when experiment_name is empty', async () => {
		const fetchPromise = fetchExperimentAssignment( {
			experimentName: '',
			anonId: null,
		} );
		await expect( fetchPromise ).rejects.toThrow();
	} );

	it( 'should throw error when experiment_name is invalid', async () => {
		const fetchPromise = fetchExperimentAssignment( {
			experimentName: '',
			anonId: null,
		} );
		await expect( fetchPromise ).rejects.toThrow();
	} );

	it( 'should return .json response', async () => {
		const data = {
			variations: { poocommerce_test: null },
			ttl: 60,
			debug: { backend_aa_result: 'request not sampled' },
		};
		window.fetch.mockImplementation( () =>
			Promise.resolve( {
				json: () => Promise.resolve( data ),
				ok: true,
				status: 200,
			} )
		);

		const assignment = await fetchExperimentAssignment( {
			experimentName: 'poocommerce_test',
			anonId: '1234',
		} );
		await expect( assignment ).toEqual( data );
	} );

	it( 'adds woo_wcadmin_install_timestamp to request args', async () => {
		const filterArgs = { args: {} };
		addFilter(
			'poocommerce_explat_request_args',
			'woo_wcadmin_install_timestamp_test',
			function ( args ) {
				filterArgs.args = args;
				return args;
			}
		);

		const fetchPromise = fetchExperimentAssignmentWithAuth( {
			experimentName: '123',
			anonId: 'abc',
		} );

		expect( filterArgs.args ).toHaveProperty(
			'woo_wcadmin_install_timestamp'
		);
		await fetchPromise;
	} );
} );

describe( 'fetchExperimentAssignmentWithDefaultVariationName', () => {
	it.each( [
		[
			'returns the default variation by name',
			{ poocommerce_test: null },
			{ poocommerce_test: { variation: 'control' } },
			{ poocommerce_test: 'control' },
		],
		[
			'keeps a non-default variation',
			{ poocommerce_test: 'treatment' },
			{ poocommerce_test: { variation: 'treatment' } },
			{ poocommerce_test: 'treatment' },
		],
		[
			'keeps null when the traffic ramp leaves the store out',
			{ poocommerce_test: null },
			{ poocommerce_test: { variation: null } },
			{ poocommerce_test: null },
		],
		[
			'keeps null when the assignment entry is null',
			{ poocommerce_test: null },
			{ poocommerce_test: null },
			{ poocommerce_test: null },
		],
		[ 'keeps the response when the experiment is not running', {}, {}, {} ],
	] )( '%s', async ( _case, variations, assignments, expected ) => {
		window.fetch.mockImplementation( () =>
			Promise.resolve( {
				json: () =>
					Promise.resolve( { variations, assignments, ttl: 60 } ),
				ok: true,
				status: 200,
			} )
		);

		const response =
			await fetchExperimentAssignmentWithDefaultVariationName( {
				experimentName: 'poocommerce_test',
				anonId: '1234',
			} );

		expect( response.variations ).toEqual( expected );
	} );
} );

describe( 'fetchExperimentAssignmentWithAuth', () => {
	it( 'applies poocommerce_explat_request_args before constructing the full URL', async () => {
		fetchMock.mockClear();
		addFilter(
			'poocommerce_explat_request_args',
			'test',
			function ( args ) {
				args.test = 'test';
				return args;
			}
		);

		const fetchPromise = fetchExperimentAssignmentWithAuth( {
			experimentName: '123',
			anonId: 'abc',
		} );

		expect( fetchMock ).toHaveBeenCalledWith(
			'/wc-admin/experiments/assignment?experiment_name=123&anon_id=abc&test=test&_locale=user',
			{
				body: undefined,
				credentials: 'include',
				headers: { Accept: 'application/json, */*;q=0.1' },
			}
		);
		await fetchPromise;
	} );

	it( 'adds woo_wcadmin_install_timestamp to request args', async () => {
		const filterArgs = { args: {} };
		addFilter(
			'poocommerce_explat_request_args',
			'woo_wcadmin_install_timestamp_test',
			function ( args ) {
				filterArgs.args = args;
				return args;
			}
		);

		const fetchPromise = fetchExperimentAssignmentWithAuth( {
			experimentName: '123',
			anonId: 'abc',
		} );

		expect( filterArgs.args ).toHaveProperty(
			'woo_wcadmin_install_timestamp'
		);
		await fetchPromise;
	} );
} );
